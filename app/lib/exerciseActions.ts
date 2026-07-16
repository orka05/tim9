"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireSession } from "./session";
import { saveVideoFile, deleteVideoFile, UploadError } from "./upload";
import type { ExerciseCategory } from "../generated/prisma/client";

export type ExerciseState = { error?: string; success?: boolean };

const categories: ExerciseCategory[] = ["SPRAVA", "REKVIZIT", "BODYWEIGHT"];

function parseCategory(value: FormDataEntryValue | null): ExerciseCategory {
  const str = String(value ?? "SPRAVA");
  return (categories as string[]).includes(str)
    ? (str as ExerciseCategory)
    : "SPRAVA";
}

/**
 * CREATE — dodavanje nove vežbe u trenerov dataset.
 * Dostupno samo ulogovanim trenerima; vežba se vezuje za trenera iz sesije.
 */
export async function createExerciseAction(
  _prev: ExerciseState,
  formData: FormData,
): Promise<ExerciseState> {
  const session = await requireSession();
  if (session.role !== "trainer") {
    return { error: "Samo treneri mogu upravljati vežbama." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = parseCategory(formData.get("category"));

  if (!name) {
    return { error: "Naziv vežbe je obavezan." };
  }
  if (name.length > 100) {
    return { error: "Naziv vežbe može imati najviše 100 karaktera." };
  }
  if (description.length > 500) {
    return { error: "Opis može imati najviše 500 karaktera." };
  }

  let videoPath: string | null = null;
  const video = formData.get("video");
  if (video instanceof File && video.size > 0) {
    try {
      videoPath = await saveVideoFile(video);
    } catch (e) {
      if (e instanceof UploadError) return { error: e.message };
      throw e;
    }
  }

  await prisma.exercise.create({
    data: {
      name,
      description,
      category,
      videoPath,
      trainerId: session.userId,
    },
  });

  revalidatePath("/vezbe");
  return { success: true };
}

/**
 * UPDATE — izmena postojeće vežbe. Trener može menjati samo svoje vežbe.
 */
export async function updateExerciseAction(
  _prev: ExerciseState,
  formData: FormData,
): Promise<ExerciseState> {
  const session = await requireSession();
  if (session.role !== "trainer") {
    return { error: "Samo treneri mogu upravljati vežbama." };
  }

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = parseCategory(formData.get("category"));

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Nepoznata vežba." };
  }
  if (!name) {
    return { error: "Naziv vežbe je obavezan." };
  }
  if (name.length > 100) {
    return { error: "Naziv vežbe može imati najviše 100 karaktera." };
  }
  if (description.length > 500) {
    return { error: "Opis može imati najviše 500 karaktera." };
  }

  // Trenutna vežba (provera vlasništva + stara putanja videa)
  const existing = await prisma.exercise.findFirst({
    where: { id, trainerId: session.userId },
  });
  if (!existing) {
    return { error: "Vežba nije pronađena ili nemaš dozvolu da je menjaš." };
  }

  let newVideoPath = existing.videoPath;
  const video = formData.get("video");
  if (video instanceof File && video.size > 0) {
    try {
      newVideoPath = await saveVideoFile(video);
    } catch (e) {
      if (e instanceof UploadError) return { error: e.message };
      throw e;
    }
  }

  await prisma.exercise.update({
    where: { id: existing.id },
    data: { name, description, category, videoPath: newVideoPath },
  });

  // Obriši stari fajl ako je zamenjen novim
  if (video instanceof File && video.size > 0 && existing.videoPath) {
    await deleteVideoFile(existing.videoPath);
  }

  revalidatePath("/vezbe");
  return { success: true };
}

/**
 * DELETE — brisanje vežbe. Trener može brisati samo svoje vežbe.
 */
export async function deleteExerciseAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "trainer") {
    redirect("/vezbe");
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const existing = await prisma.exercise.findFirst({
    where: { id, trainerId: session.userId },
  });
  if (!existing) return;

  await prisma.exercise.delete({ where: { id: existing.id } });
  await deleteVideoFile(existing.videoPath);

  revalidatePath("/vezbe");
}
