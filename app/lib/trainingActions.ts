"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "./session";
import { TrainingRepository } from "../repositories/TrainingRepository";
import { TrainingBlockRepository } from "../repositories/TrainingBlockRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";
import { TrainerReviewRepository } from "../repositories/TrainerReviewRepository";
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

/**
 * DELETE — trener briše svoj trening (npr. ako je napravljen greškom).
 * Blokovi se brišu kroz kaskadu; nakon brisanja vraća na listu treninga.
 */
export async function deleteTrainingAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "trainer") redirect("/");

  const trainingId = Number(formData.get("trainingId"));
  const clientId = Number(formData.get("clientId"));

  if (Number.isInteger(trainingId) && trainingId > 0) {
    const training = await TrainingRepository.findOwnedSummary(
      trainingId,
      session.userId,
    );
    if (training) {
      await TrainingRepository.deleteOwned(trainingId, session.userId);
      revalidatePath("/");
      revalidatePath("/treninzi");
    }
  }

  redirect(
    Number.isInteger(clientId) && clientId > 0
      ? `/treninzi?clientId=${clientId}`
      : "/treninzi",
  );
}

export type RatingState = {
  error?: string;
  success?: boolean;
  rating?: number;
};

export type RateExerciseState = RatingState;
export type RateTrainingState = RatingState;
export type RateTrainerState = RatingState;

function isValidExerciseRating(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

function isValidTrainingRating(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 10;
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
  if (!isValidExerciseRating(rating)) {
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

/**
 * Klijent ocenjuje ceo trening koji mu je dodeljen.
 * Ocena je broj od 1 do 10.
 */
export async function rateTrainingAction(
  _prev: RateTrainingState,
  formData: FormData,
): Promise<RateTrainingState> {
  const session = await requireSession();
  if (session.role !== "client") {
    return { error: "Samo klijent može oceniti trening." };
  }

  const trainingId = Number(formData.get("trainingId"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(trainingId) || trainingId <= 0) {
    return { error: "Trening nije ispravno izabran." };
  }
  if (!isValidTrainingRating(rating)) {
    return { error: "Ocena mora biti ceo broj od 1 do 10." };
  }
  if (comment.length > 500) {
    return { error: "Komentar može imati najviše 500 karaktera." };
  }

  const saved = await TrainingRepository.setClientTrainingRating(
    trainingId,
    session.userId,
    rating,
    comment || null,
  );
  if (!saved) {
    return { error: "Trening nije pronađen ili nemaš dozvolu da ga oceniš." };
  }

  revalidatePath(`/moji-treninzi/${trainingId}`);
  return { success: true, rating };
}

/**
 * Klijent ocenjuje trenera u kontekstu konkretnog svog treninga.
 * Prosečna ocena trenera se ažurira u istoj transakciji sa upisom ocene.
 */
export async function rateTrainerAction(
  _prev: RateTrainerState,
  formData: FormData,
): Promise<RateTrainerState> {
  const session = await requireSession();
  if (session.role !== "client") {
    return { error: "Samo klijent može oceniti trenera." };
  }

  const trainingId = Number(formData.get("trainingId"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(trainingId) || trainingId <= 0) {
    return { error: "Trening nije ispravno izabran." };
  }
  if (!isValidTrainingRating(rating)) {
    return { error: "Ocena mora biti ceo broj od 1 do 10." };
  }
  if (comment.length > 500) {
    return { error: "Komentar može imati najviše 500 karaktera." };
  }

  const saved = await TrainerReviewRepository.rateViaTraining(
    trainingId,
    session.userId,
    rating,
    comment || null,
  );
  if (!saved) {
    return { error: "Trening nije pronađen ili nemaš dozvolu da oceniš trenera." };
  }

  revalidatePath(`/moji-treninzi/${trainingId}`);
  revalidatePath("/moji-treneri");
  revalidatePath("/trainers");
  revalidatePath("/");
  return { success: true, rating };
}
