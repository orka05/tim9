"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "./session";
import { EquipmentRepository } from "../repositories/EquipmentRepository";
import type { EquipmentType } from "../models/Equipment";

export type EquipmentState = { error?: string; success?: boolean };

const types: EquipmentType[] = ["SPRAVA", "REKVIZIT"];

function parseType(value: FormDataEntryValue | null): EquipmentType {
  const str = String(value ?? "SPRAVA");
  return (types as string[]).includes(str) ? (str as EquipmentType) : "SPRAVA";
}

/**
 * CREATE — dodavanje nove opreme (sprave ili rekvizita) u klijentov inventar.
 * Dostupno samo ulogovanim klijentima; oprema se vezuje za klijenta iz sesije.
 */
export async function createEquipmentAction(
  _prev: EquipmentState,
  formData: FormData,
): Promise<EquipmentState> {
  const session = await requireSession();
  if (session.role !== "client") {
    return { error: "Samo klijenti mogu upravljati opremom." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = parseType(formData.get("type"));

  if (!name) {
    return { error: "Naziv opreme je obavezan." };
  }
  if (name.length > 100) {
    return { error: "Naziv opreme može imati najviše 100 karaktera." };
  }
  if (description.length > 500) {
    return { error: "Opis može imati najviše 500 karaktera." };
  }

  await EquipmentRepository.create({
    name,
    description,
    type,
    clientId: session.userId,
  });

  revalidatePath("/oprema");
  return { success: true };
}

/**
 * UPDATE — izmena postojeće opreme. Klijent može menjati samo svoju opremu.
 */
export async function updateEquipmentAction(
  _prev: EquipmentState,
  formData: FormData,
): Promise<EquipmentState> {
  const session = await requireSession();
  if (session.role !== "client") {
    return { error: "Samo klijenti mogu upravljati opremom." };
  }

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = parseType(formData.get("type"));

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Nepoznata oprema." };
  }
  if (!name) {
    return { error: "Naziv opreme je obavezan." };
  }
  if (name.length > 100) {
    return { error: "Naziv opreme može imati najviše 100 karaktera." };
  }
  if (description.length > 500) {
    return { error: "Opis može imati najviše 500 karaktera." };
  }

  const existing = await EquipmentRepository.findOwnedById(id, session.userId);
  if (!existing) {
    return { error: "Oprema nije pronađena ili nemaš dozvolu da je menjaš." };
  }

  await EquipmentRepository.update(existing.id, { name, description, type });

  revalidatePath("/oprema");
  return { success: true };
}

/**
 * DELETE — brisanje opreme. Klijent može brisati samo svoju opremu.
 */
export async function deleteEquipmentAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "client") {
    redirect("/oprema");
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const existing = await EquipmentRepository.findOwnedById(id, session.userId);
  if (!existing) return;

  await EquipmentRepository.delete(existing.id);

  revalidatePath("/oprema");
}