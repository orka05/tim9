import "server-only";
import { prisma } from "../lib/prisma";
import { Exercise, type ExerciseCategory } from "../models/Exercise";
import type { Exercise as ExerciseRow } from "../generated/prisma/client";

export type ExerciseOption = {
  id: number;
  name: string;
  category: string;
};

type ExerciseCreateInput = {
  name: string;
  description: string;
  category: ExerciseCategory;
  videoPath: string | null;
  trainerId: number;
};

type ExerciseUpdateInput = {
  name: string;
  description: string;
  category: ExerciseCategory;
  videoPath: string | null;
};

/** Repozitorijum za entitet Vežba. */
export class ExerciseRepository {
  private static toModel(row: ExerciseRow): Exercise {
    return new Exercise(
      row.id,
      row.name,
      row.description,
      row.category as ExerciseCategory,
      row.videoPath,
      row.trainerId,
    );
  }

  static async findByTrainer(trainerId: number): Promise<Exercise[]> {
    const rows = await prisma.exercise.findMany({
      where: { trainerId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ExerciseRepository.toModel(row));
  }

  static async findOptionsByTrainer(
    trainerId: number,
  ): Promise<ExerciseOption[]> {
    return prisma.exercise.findMany({
      where: { trainerId },
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    });
  }

  static async findOwnedById(
    id: number,
    trainerId: number,
  ): Promise<Exercise | null> {
    const row = await prisma.exercise.findFirst({
      where: { id, trainerId },
    });
    return row ? ExerciseRepository.toModel(row) : null;
  }

  static async countOwned(
    exerciseIds: number[],
    trainerId: number,
  ): Promise<number> {
    return prisma.exercise.count({
      where: { id: { in: exerciseIds }, trainerId },
    });
  }

  static async create(input: ExerciseCreateInput): Promise<void> {
    await prisma.exercise.create({ data: input });
  }

  static async update(id: number, input: ExerciseUpdateInput): Promise<void> {
    await prisma.exercise.update({ where: { id }, data: input });
  }

  /** Da li se vežba koristi u nekom treningu (blok trening plana). */
  static async isUsedInTraining(exerciseId: number): Promise<boolean> {
    const count = await prisma.trainingBlock.count({ where: { exerciseId } });
    return count > 0;
  }

  static async delete(id: number): Promise<void> {
    await prisma.exercise.delete({ where: { id } });
  }
}
