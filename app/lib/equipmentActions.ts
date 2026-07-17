"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./session";
import { EquipmentRepository } from "../repositories/EquipmentRepository";
import type { EquipmentType } from "../models/Equipment";

export type EquipmentState = { error?: string; success?: boolean };

const types: EquipmentType[] = ["SPRAVA", "REKVIZIT"];

function parseType(value: FormDataEntryValue | null): EquipmentType {
  const str = String(value ?? "SPRAVA");
  return (types as string[]).includes(str) ? (str as EquipmentType) : "SPRAVA";
}

type ParsedForm =
  | { ok: true; name: string; description: string; type: EquipmentType }
  | { ok: false; error: string };

function parseEquipmentForm(formData: FormData): ParsedForm {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = parseType(formData.get("type"));

  if (!name) return { ok: false, error: "Naziv opreme je obavezan." };
  if (name.length > 100) {
    return { ok: false, error: "Naziv opreme može imati najviše 100 karaktera." };
  }
  if (description.length > 500) {
    return { ok: false, error: "Opis može imati najviše 500 karaktera." };
  }
  return { ok: true, name, description, type };
}

// ── KLIJENT: vlasništvo i custom oprema ───────────────────────────────────

/** Klijent označava baznu opremu (iz kataloga) kao svoju. */
export async function addOwnedEquipmentAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "client") return;

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await EquipmentRepository.addOwnership(session.userId, id);
  revalidatePath("/oprema");
}

/** Klijent uklanja baznu opremu iz svoje liste. */
export async function removeOwnedEquipmentAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "client") return;

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await EquipmentRepository.removeOwnership(session.userId, id);
  revalidatePath("/oprema");
}

/** CREATE — klijent pravi svoju custom opremu. */
export async function createCustomEquipmentAction(
  _prev: EquipmentState,
  formData: FormData,
): Promise<EquipmentState> {
  const session = await requireSession();
  if (session.role !== "client") {
    return { error: "Samo klijenti mogu praviti svoju opremu." };
  }

  const parsed = parseEquipmentForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await EquipmentRepository.createCustom({
    name: parsed.name,
    description: parsed.description,
    type: parsed.type,
    clientId: session.userId,
  });

  revalidatePath("/oprema");
  return { success: true };
}

/** UPDATE — klijent menja svoju custom opremu. */
export async function updateCustomEquipmentAction(
  _prev: EquipmentState,
  formData: FormData,
): Promise<EquipmentState> {
  const session = await requireSession();
  if (session.role !== "client") {
    return { error: "Samo klijenti mogu menjati svoju opremu." };
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Nepoznata oprema." };
  }

  const parsed = parseEquipmentForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const existing = await EquipmentRepository.findOwnedCustomById(
    id,
    session.userId,
  );
  if (!existing) {
    return { error: "Oprema nije pronađena ili nemaš dozvolu da je menjaš." };
  }

  await EquipmentRepository.updateCustom(existing.id, {
    name: parsed.name,
    description: parsed.description,
    type: parsed.type,
  });

  revalidatePath("/oprema");
  return { success: true };
}

/** DELETE — klijent briše svoju custom opremu. */
export async function deleteCustomEquipmentAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "client") return;

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const existing = await EquipmentRepository.findOwnedCustomById(
    id,
    session.userId,
  );
  if (!existing) return;

  await EquipmentRepository.deleteCustom(existing.id);
  revalidatePath("/oprema");
}

// ── ADMIN: bazni katalog ──────────────────────────────────────────────────

/** CREATE — admin dodaje baznu opremu u katalog. */
export async function createBaseEquipmentAction(
  _prev: EquipmentState,
  formData: FormData,
): Promise<EquipmentState> {
  const session = await requireSession();
  if (session.role !== "admin") {
    return { error: "Samo admin može upravljati katalogom opreme." };
  }

  const parsed = parseEquipmentForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await EquipmentRepository.createBase({
    name: parsed.name,
    description: parsed.description,
    type: parsed.type,
  });

  revalidatePath("/oprema-katalog");
  return { success: true };
}

/** UPDATE — admin menja baznu opremu. */
export async function updateBaseEquipmentAction(
  _prev: EquipmentState,
  formData: FormData,
): Promise<EquipmentState> {
  const session = await requireSession();
  if (session.role !== "admin") {
    return { error: "Samo admin može upravljati katalogom opreme." };
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Nepoznata oprema." };
  }

  const parsed = parseEquipmentForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const existing = await EquipmentRepository.findBaseById(id);
  if (!existing) {
    return { error: "Bazna oprema nije pronađena." };
  }

  await EquipmentRepository.updateBase(existing.id, {
    name: parsed.name,
    description: parsed.description,
    type: parsed.type,
  });

  revalidatePath("/oprema-katalog");
  return { success: true };
}

/** DELETE — admin briše baznu opremu (uklanja se i iz lista klijenata). */
export async function deleteBaseEquipmentAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "admin") return;

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await EquipmentRepository.deleteBase(id);
  revalidatePath("/oprema-katalog");
}