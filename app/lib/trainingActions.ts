"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./session";
import { TrainingRepository } from "../repositories/TrainingRepository";
import { TrainingBlockRepository } from "../repositories/TrainingBlockRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";
import { ExerciseRepository } from "../repositories/ExerciseRepository";

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

  const hasAccepted = await TrainerRequestRepository.hasAccepted(
    session.userId,
    clientId,
  );
  if (!hasAccepted) {
    return { error: "Trening možeš kreirati samo za prihvaćenog klijenta." };
  }

  const exerciseIds = [...new Set(blocks.map((block) => block.exerciseId))];
  const ownedExercises = await ExerciseRepository.countOwned(
    exerciseIds,
    session.userId,
  );
  if (ownedExercises !== exerciseIds.length) {
    return { error: "Jedna ili više vežbi nisu deo tvog skupa vežbi." };
  }

  const trainingId = await TrainingRepository.create({
    title,
    scheduledFor,
    trainerId: session.userId,
    clientId,
    blocks,
  });

  revalidatePath("/");
  revalidatePath("/treninzi/novi");
  return { success: true, trainingId };
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

  const training = await TrainingRepository.findOwnedSummary(
    trainingId,
    session.userId,
  );
  if (!training) {
    return { error: "Trening nije pronađen ili nemaš dozvolu da ga menjaš." };
  }

  const exerciseIds = [...new Set(blocks.map((block) => block.exerciseId))];
  const ownedExercises = await ExerciseRepository.countOwned(
    exerciseIds,
    session.userId,
  );
  if (ownedExercises !== exerciseIds.length) {
    return { error: "Jedna ili više vežbi nisu deo tvog skupa vežbi." };
  }

  await TrainingRepository.replaceBlocks(trainingId, {
    title,
    scheduledFor,
    blocks,
  });

  revalidatePath("/");
  revalidatePath("/treninzi");
  revalidatePath(`/treninzi/${trainingId}/izmeni`);
  revalidatePath(`/moji-treninzi/${trainingId}`);
  return { success: true, trainingId };
}

export type RateExerciseState = {
  error?: string;
  success?: boolean;
  rating?: number;
};

function isValidRating(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

/**
 * Klijent ocenjuje pojedinačnu vežbu (TrainingBlock) u okviru svog treninga.
 * Ocena je broj od 1 do 5.
 */
export async function rateTrainingBlockAction(
  _prev: RateExerciseState,
  formData: FormData,
): Promise<RateExerciseState> {
  const session = await requireSession();
  if (session.role !== "client") {
    return { error: "Samo klijent može oceniti vežbu." };
  }

  const blockId = Number(formData.get("blockId"));
  const rating = Number(formData.get("rating"));

  if (!Number.isInteger(blockId) || blockId <= 0) {
    return { error: "Vežba nije ispravno izabrana." };
  }
  if (!isValidRating(rating)) {
    return { error: "Ocena mora biti ceo broj od 1 do 5." };
  }

  const block = await TrainingBlockRepository.findWithClientId(blockId);

  if (!block || block.clientId !== session.userId) {
    return { error: "Vežba nije pronađena ili nemaš dozvolu da je oceniš." };
  }

  await TrainingBlockRepository.setRating(blockId, rating);

  revalidatePath(`/moji-treninzi/${block.trainingId}`);
  return { success: true, rating };
}