"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireSession } from "./session";
import type { EquipmentCategory } from "../generated/prisma/client";

export type EquipmentState = { error?: string; success?: boolean };

const categories: EquipmentCategory[] = [
  "KARDIO",
  "TEGOVI",
  "MASINE",
  "FUNKCIONALNI_TRENING",
  "OSTALO",
];

function parseCategory(value: FormDataEntryValue | null): EquipmentCategory {
  const str = String(value ?? "OSTALO");
  return (categories as string[]).includes(str)
    ? (str as EquipmentCategory)
    : "OSTALO";
}

/**
 * CREATE — dodavanje nove sprave za vežbanje.
 * Dostupno samo ulogovanim trenerima; sprava se vezuje za trenera iz sesije.
 */
export async function createEquipmentAction(
  _prev: EquipmentState,
  formData: FormData,
): Promise<EquipmentState> {
  const session = await requireSession();
  if (session.role !== "trainer") {
    return { error: "Samo treneri mogu upravljati spravama za vežbanje." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = parseCategory(formData.get("category"));
  const quantity = Number(formData.get("quantity") ?? 1);

  if (!name) {
    return { error: "Naziv sprave je obavezan." };
  }
  if (name.length > 100) {
    return { error: "Naziv sprave može imati najviše 100 karaktera." };
  }
  if (description.length > 500) {
    return { error: "Opis može imati najviše 500 karaktera." };
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: "Količina mora biti pozitivan ceo broj." };
  }

  await prisma.equipment.create({
    data: {
      name,
      description,
      category,
      quantity,
      trainerId: session.userId,
    },
  });

  revalidatePath("/equipment");
  return { success: true };
}

/**
 * UPDATE — izmena postojeće sprave. Trener može menjati samo svoje sprave.
 */
export async function updateEquipmentAction(
  _prev: EquipmentState,
  formData: FormData,
): Promise<EquipmentState> {
  const session = await requireSession();
  if (session.role !== "trainer") {
    return { error: "Samo treneri mogu upravljati spravama za vežbanje." };
  }

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = parseCategory(formData.get("category"));
  const quantity = Number(formData.get("quantity") ?? 1);

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Nepoznata sprava." };
  }
  if (!name) {
    return { error: "Naziv sprave je obavezan." };
  }
  if (name.length > 100) {
    return { error: "Naziv sprave može imati najviše 100 karaktera." };
  }
  if (description.length > 500) {
    return { error: "Opis može imati najviše 500 karaktera." };
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: "Količina mora biti pozitivan ceo broj." };
  }

  const result = await prisma.equipment.updateMany({
    where: { id, trainerId: session.userId },
    data: { name, description, category, quantity },
  });

  if (result.count === 0) {
    return { error: "Sprava nije pronađena ili nemaš dozvolu da je menjaš." };
  }

  revalidatePath("/equipment");
  return { success: true };
}

/**
 * DELETE — brisanje sprave. Trener može brisati samo svoje sprave.
 */
export async function deleteEquipmentAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "trainer") {
    redirect("/equipment");
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await prisma.equipment.deleteMany({
    where: { id, trainerId: session.userId },
  });

  revalidatePath("/equipment");
}