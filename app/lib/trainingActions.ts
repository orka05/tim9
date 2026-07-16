"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireSession } from "./session";

export type TrainingState = {
  error?: string;
  success?: boolean;
  trainingId?: number;
};

type SubmittedBlock = {
  exerciseId: number;
  sets: number;
  repetitions: number;
  restSeconds: number;
  notes: string;
};

function integerInRange(value: unknown, min: number, max: number) {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

function parseBlocks(value: FormDataEntryValue | null): SubmittedBlock[] | null {
  try {
    const parsed: unknown = JSON.parse(String(value ?? ""));
    if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 50) {
      return null;
    }

    const blocks: SubmittedBlock[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") return null;
      const block = item as Record<string, unknown>;
      if (
        !integerInRange(block.exerciseId, 1, Number.MAX_SAFE_INTEGER) ||
        !integerInRange(block.sets, 1, 100) ||
        !integerInRange(block.repetitions, 1, 1000) ||
        !integerInRange(block.restSeconds, 0, 3600) ||
        typeof block.notes !== "string" ||
        block.notes.trim().length > 500
      ) {
        return null;
      }
      blocks.push({
        exerciseId: Number(block.exerciseId),
        sets: Number(block.sets),
        repetitions: Number(block.repetitions),
        restSeconds: Number(block.restSeconds),
        notes: block.notes.trim(),
      });
    }
    return blocks;
  } catch {
    return null;
  }
}

export async function createTrainingAction(
  _prev: TrainingState,
  formData: FormData,
): Promise<TrainingState> {
  const session = await requireSession();
  if (session.role !== "trainer") {
    return { error: "Samo trener može kreirati trening." };
  }

  const clientId = Number(formData.get("clientId"));
  const title = String(formData.get("title") ?? "").trim();
  const scheduledFor = parseDate(String(formData.get("scheduledFor") ?? ""));
  const blocks = parseBlocks(formData.get("blocks"));

  if (!Number.isInteger(clientId) || clientId <= 0) {
    return { error: "Klijent nije ispravno izabran." };
  }
  if (!title || title.length > 120) {
    return { error: "Naziv treninga je obavezan i može imati do 120 karaktera." };
  }
  if (!scheduledFor) {
    return { error: "Izaberi ispravan datum treninga." };
  }
  if (!blocks) {
    return { error: "Dodaj od 1 do 50 ispravno popunjenih blokova." };
  }

  const acceptedRequest = await prisma.trainerRequest.findFirst({
    where: {
      trainerId: session.userId,
      clientId,
      status: "ACCEPTED",
    },
    select: { id: true },
  });
  if (!acceptedRequest) {
    return { error: "Trening možeš kreirati samo za prihvaćenog klijenta." };
  }

  const exerciseIds = [...new Set(blocks.map((block) => block.exerciseId))];
  const ownedExercises = await prisma.exercise.count({
    where: { id: { in: exerciseIds }, trainerId: session.userId },
  });
  if (ownedExercises !== exerciseIds.length) {
    return { error: "Jedna ili više vežbi nisu deo tvog skupa vežbi." };
  }

  const training = await prisma.training.create({
    data: {
      title,
      scheduledFor,
      trainerId: session.userId,
      clientId,
      blocks: {
        create: blocks.map((block, position) => ({
          exerciseId: block.exerciseId,
          position,
          sets: block.sets,
          repetitions: block.repetitions,
          restSeconds: block.restSeconds,
          notes: block.notes,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/treninzi/novi");
  return { success: true, trainingId: training.id };
}

export async function updateTrainingAction(
  _prev: TrainingState,
  formData: FormData,
): Promise<TrainingState> {
  const session = await requireSession();
  if (session.role !== "trainer") {
    return { error: "Samo trener može menjati trening." };
  }

  const trainingId = Number(formData.get("trainingId"));
  const title = String(formData.get("title") ?? "").trim();
  const scheduledFor = parseDate(String(formData.get("scheduledFor") ?? ""));
  const blocks = parseBlocks(formData.get("blocks"));

  if (!Number.isInteger(trainingId) || trainingId <= 0) {
    return { error: "Trening nije ispravno izabran." };
  }
  if (!title || title.length > 120) {
    return { error: "Naziv treninga je obavezan i može imati do 120 karaktera." };
  }
  if (!scheduledFor) {
    return { error: "Izaberi ispravan datum treninga." };
  }
  if (!blocks) {
    return { error: "Dodaj od 1 do 50 ispravno popunjenih blokova." };
  }

  const training = await prisma.training.findFirst({
    where: { id: trainingId, trainerId: session.userId },
    select: { id: true, clientId: true },
  });
  if (!training) {
    return { error: "Trening nije pronađen ili nemaš dozvolu da ga menjaš." };
  }

  const exerciseIds = [...new Set(blocks.map((block) => block.exerciseId))];
  const ownedExercises = await prisma.exercise.count({
    where: { id: { in: exerciseIds }, trainerId: session.userId },
  });
  if (ownedExercises !== exerciseIds.length) {
    return { error: "Jedna ili više vežbi nisu deo tvog skupa vežbi." };
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.trainingBlock.deleteMany({ where: { trainingId } });
    await transaction.training.update({
      where: { id: trainingId },
      data: {
        title,
        scheduledFor,
        blocks: {
          create: blocks.map((block, position) => ({
            exerciseId: block.exerciseId,
            position,
            sets: block.sets,
            repetitions: block.repetitions,
            restSeconds: block.restSeconds,
            notes: block.notes,
          })),
        },
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/treninzi");
  revalidatePath(`/treninzi/${trainingId}/izmeni`);
  revalidatePath(`/moji-treninzi/${trainingId}`);
  return { success: true, trainingId };
}
