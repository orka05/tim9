import "server-only";
import { prisma } from "../lib/prisma";
import { Training } from "../models/Training";
import { TrainingBlock } from "../models/TrainingBlock";

export type TrainingBlockInput = {
  exerciseId: number;
  sets: number;
  repetitions: number;
  restSeconds: number;
  notes: string;
};

type TrainingCreateInput = {
  title: string;
  scheduledFor: Date;
  trainerId: number;
  clientId: number;
  blocks: TrainingBlockInput[];
};

type TrainingUpdateInput = {
  title: string;
  scheduledFor: Date;
  blocks: TrainingBlockInput[];
};

function toBlockCreateData(blocks: TrainingBlockInput[]) {
  return blocks.map((block, position) => ({
    exerciseId: block.exerciseId,
    position,
    sets: block.sets,
    repetitions: block.repetitions,
    restSeconds: block.restSeconds,
    notes: block.notes,
  }));
}

/** Repozitorijum za entitet Trening. */
export class TrainingRepository {
  static async create(input: TrainingCreateInput): Promise<number> {
    const training = await prisma.training.create({
      data: {
        title: input.title,
        scheduledFor: input.scheduledFor,
        trainerId: input.trainerId,
        clientId: input.clientId,
        blocks: { create: toBlockCreateData(input.blocks) },
      },
    });
    return training.id;
  }

  static async findOwnedSummary(
    id: number,
    trainerId: number,
  ): Promise<{ id: number; clientId: number } | null> {
    return prisma.training.findFirst({
      where: { id, trainerId },
      select: { id: true, clientId: true },
    });
  }

  static async replaceBlocks(
    trainingId: number,
    input: TrainingUpdateInput,
  ): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await transaction.trainingBlock.deleteMany({ where: { trainingId } });
      await transaction.training.update({
        where: { id: trainingId },
        data: {
          title: input.title,
          scheduledFor: input.scheduledFor,
          blocks: { create: toBlockCreateData(input.blocks) },
        },
      });
    });
  }

  static async setClientTrainingRating(
    trainingId: number,
    clientId: number,
    rating: number,
    comment: string | null,
  ): Promise<boolean> {
    const result = await prisma.training.updateMany({
      where: { id: trainingId, clientId },
      data: { trainingRating: rating, trainingComment: comment },
    });
    return result.count === 1;
  }

  static async findClientTrainingDetail(
    id: number,
    clientId: number,
  ): Promise<ClientTrainingDetail | null> {
    const row = await prisma.training.findFirst({
      where: { id, clientId },
      select: {
        id: true,
        title: true,
        scheduledFor: true,
        trainerId: true,
        trainingRating: true,
        trainingComment: true,
        trainer: { select: { name: true, specialty: true, email: true } },
        blocks: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            exerciseId: true,
            position: true,
            sets: true,
            repetitions: true,
            restSeconds: true,
            notes: true,
            clientRating: true,
            exercise: {
              select: { name: true, description: true, videoPath: true },
            },
          },
        },
      },
    });
    if (!row) return null;
    return {
      training: new Training(
        row.id,
        row.title,
        row.scheduledFor,
        row.trainerId,
        clientId,
      ),
      trainingRating: row.trainingRating,
      trainingComment: row.trainingComment,
      trainer: row.trainer,
      blocks: row.blocks.map((block) => ({
        block: new TrainingBlock(
          block.id,
          row.id,
          block.exerciseId,
          block.position,
          block.sets,
          block.repetitions,
          block.restSeconds,
          block.notes,
          block.clientRating,
        ),
        exercise: {
          name: block.exercise.name,
          description: block.exercise.description,
          videoPath: block.exercise.videoPath,
        },
      })),
    };
  }

  static async findTrainerTrainings(
    trainerId: number,
    clientId?: number,
  ): Promise<TrainerTrainingSummary[]> {
    const rows = await prisma.training.findMany({
      where: { trainerId, ...(clientId ? { clientId } : {}) },
      orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        scheduledFor: true,
        clientId: true,
        trainingRating: true,
        trainingComment: true,
        client: { select: { name: true, email: true } },
        blocks: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            exerciseId: true,
            position: true,
            sets: true,
            repetitions: true,
            restSeconds: true,
            notes: true,
            clientRating: true,
            exercise: { select: { name: true } },
          },
        },
      },
    });
    return rows.map((row) => ({
      training: new Training(
        row.id,
        row.title,
        row.scheduledFor,
        trainerId,
        row.clientId,
      ),
      trainingRating: row.trainingRating,
      trainingComment: row.trainingComment,
      client: row.client,
      blocks: row.blocks.map((block) => ({
        block: new TrainingBlock(
          block.id,
          row.id,
          block.exerciseId,
          block.position,
          block.sets,
          block.repetitions,
          block.restSeconds,
          block.notes,
          block.clientRating,
        ),
        exerciseName: block.exercise.name,
      })),
    }));
  }

  static async findForEdit(
    id: number,
    trainerId: number,
  ): Promise<TrainingEditData | null> {
    const row = await prisma.training.findFirst({
      where: { id, trainerId },
      select: {
        id: true,
        title: true,
        scheduledFor: true,
        client: { select: { id: true, name: true } },
        blocks: {
          orderBy: { position: "asc" },
          select: {
            exerciseId: true,
            sets: true,
            repetitions: true,
            restSeconds: true,
            notes: true,
          },
        },
      },
    });
    if (!row) return null;
    return {
      training: new Training(
        row.id,
        row.title,
        row.scheduledFor,
        trainerId,
        row.client.id,
      ),
      client: row.client,
      blocks: row.blocks,
    };
  }

  /** Briše trening (i njegove blokove kroz kaskadu) ako pripada treneru. */
  static async deleteOwned(id: number, trainerId: number): Promise<void> {
    await prisma.training.deleteMany({ where: { id, trainerId } });
  }
}

export type ClientTrainingDetail = {
  training: Training;
  trainingRating: number | null;
  trainingComment: string | null;
  trainer: { name: string; specialty: string; email: string };
  blocks: {
    block: TrainingBlock;
    exercise: { name: string; description: string; videoPath: string | null };
  }[];
};

export type TrainerTrainingSummary = {
  training: Training;
  trainingRating: number | null;
  trainingComment: string | null;
  client: { name: string; email: string };
  blocks: {
    block: TrainingBlock;
    exerciseName: string;
  }[];
};

export type TrainingEditData = {
  training: Training;
  client: { id: number; name: string };
  blocks: {
    exerciseId: number;
    sets: number;
    repetitions: number;
    restSeconds: number;
    notes: string;
  }[];
};
