import "server-only";
import { prisma } from "../lib/prisma";

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
    return prisma.training.findFirst({
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
  }

  static async findTrainerTrainings(
    trainerId: number,
    clientId?: number,
  ): Promise<TrainerTrainingSummary[]> {
    return prisma.training.findMany({
      where: { trainerId, ...(clientId ? { clientId } : {}) },
      orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        scheduledFor: true,
        clientId: true,
        trainingRating: true,
        client: { select: { name: true, email: true } },
        blocks: {
          orderBy: { position: "asc" },
          select: {
            id: true,
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
  }

  static async findForEdit(
    id: number,
    trainerId: number,
  ): Promise<TrainingEditData | null> {
    return prisma.training.findFirst({
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
  }

  /** Briše trening (i njegove blokove kroz kaskadu) ako pripada treneru. */
  static async deleteOwned(id: number, trainerId: number): Promise<void> {
    await prisma.training.deleteMany({ where: { id, trainerId } });
  }
}

export type ClientTrainingDetail = {
  id: number;
  title: string;
  scheduledFor: Date;
  trainerId: number;
  trainingRating: number | null;
  trainingComment: string | null;
  trainer: { name: string; specialty: string; email: string };
  blocks: {
    id: number;
    sets: number;
    repetitions: number;
    restSeconds: number;
    notes: string;
    clientRating: number | null;
    exercise: { name: string; description: string; videoPath: string | null };
  }[];
};

export type TrainerTrainingSummary = {
  id: number;
  title: string;
  scheduledFor: Date;
  clientId: number;
  trainingRating: number | null;
  client: { name: string; email: string };
  blocks: {
    id: number;
    sets: number;
    repetitions: number;
    restSeconds: number;
    notes: string;
    clientRating: number | null;
    exercise: { name: string };
  }[];
};

export type TrainingEditData = {
  id: number;
  title: string;
  scheduledFor: Date;
  client: { id: number; name: string };
  blocks: {
    exerciseId: number;
    sets: number;
    repetitions: number;
    restSeconds: number;
    notes: string;
  }[];
};
