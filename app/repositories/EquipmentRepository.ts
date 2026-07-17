import "server-only";
import { prisma } from "../lib/prisma";
import { Equipment, type EquipmentType } from "../models/Equipment";
import type { Equipment as EquipmentRow } from "../generated/prisma/client";

type BaseEquipmentInput = {
  name: string;
  description: string;
  type: EquipmentType;
};

type CustomEquipmentInput = {
  name: string;
  description: string;
  type: EquipmentType;
  clientId: number;
};

/** Oprema koju klijent poseduje, sa oznakom da li je njegova custom stavka. */
export type OwnedEquipment = {
  id: number;
  name: string;
  description: string;
  type: EquipmentType;
  isCustom: boolean;
};

/**
 * Repozitorijum za entitet Oprema.
 * Bazni katalog kreira admin (`isBase = true`), a klijent bira šta poseduje
 * (spona `ClientEquipment`) ili pravi svoju custom opremu.
 */
export class EquipmentRepository {
  private static toModel(row: EquipmentRow): Equipment {
    return new Equipment(
      row.id,
      row.name,
      row.description,
      row.type as EquipmentType,
      row.isBase,
      row.createdById,
    );
  }

  // ── ADMIN: bazni katalog ────────────────────────────────────────────────

  static async findAllBase(): Promise<Equipment[]> {
    const rows = await prisma.equipment.findMany({
      where: { isBase: true },
      orderBy: { name: "asc" },
    });
    return rows.map((row) => EquipmentRepository.toModel(row));
  }

  static async findBaseById(id: number): Promise<Equipment | null> {
    const row = await prisma.equipment.findFirst({
      where: { id, isBase: true },
    });
    return row ? EquipmentRepository.toModel(row) : null;
  }

  static async createBase(input: BaseEquipmentInput): Promise<void> {
    await prisma.equipment.create({
      data: { ...input, isBase: true, createdById: null },
    });
  }

  static async updateBase(
    id: number,
    input: BaseEquipmentInput,
  ): Promise<void> {
    await prisma.equipment.updateMany({
      where: { id, isBase: true },
      data: input,
    });
  }

  static async deleteBase(id: number): Promise<void> {
    // Kaskada na ClientEquipment automatski uklanja opremu iz lista klijenata.
    await prisma.equipment.deleteMany({ where: { id, isBase: true } });
  }

  // ── KLIJENT: vlasništvo i custom oprema ─────────────────────────────────

  static async findOwnedByClient(
    clientId: number,
  ): Promise<OwnedEquipment[]> {
    const rows = await prisma.clientEquipment.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      select: {
        equipment: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            isBase: true,
            createdById: true,
          },
        },
      },
    });
    return rows.map(({ equipment }) => ({
      id: equipment.id,
      name: equipment.name,
      description: equipment.description,
      type: equipment.type as EquipmentType,
      isCustom: !equipment.isBase && equipment.createdById === clientId,
    }));
  }

  static async findBaseNotOwnedByClient(
    clientId: number,
  ): Promise<Equipment[]> {
    const owned = await prisma.clientEquipment.findMany({
      where: { clientId },
      select: { equipmentId: true },
    });
    const ownedIds = owned.map((o) => o.equipmentId);
    const rows = await prisma.equipment.findMany({
      where: { isBase: true, id: { notIn: ownedIds } },
      orderBy: { name: "asc" },
    });
    return rows.map((row) => EquipmentRepository.toModel(row));
  }

  /** Klijent označava baznu opremu kao svoju. Vraća false ako id nije bazni. */
  static async addOwnership(
    clientId: number,
    equipmentId: number,
  ): Promise<boolean> {
    const base = await prisma.equipment.findFirst({
      where: { id: equipmentId, isBase: true },
      select: { id: true },
    });
    if (!base) return false;

    await prisma.clientEquipment.upsert({
      where: { clientId_equipmentId: { clientId, equipmentId } },
      create: { clientId, equipmentId },
      update: {},
    });
    return true;
  }

  /** Uklanja baznu opremu iz klijentove liste (samo spona, ne i katalog). */
  static async removeOwnership(
    clientId: number,
    equipmentId: number,
  ): Promise<void> {
    await prisma.clientEquipment.deleteMany({
      where: { clientId, equipmentId },
    });
  }

  static async createCustom(input: CustomEquipmentInput): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          isBase: false,
          createdById: input.clientId,
        },
      });
      await tx.clientEquipment.create({
        data: { clientId: input.clientId, equipmentId: equipment.id },
      });
    });
  }

  static async findOwnedCustomById(
    id: number,
    clientId: number,
  ): Promise<Equipment | null> {
    const row = await prisma.equipment.findFirst({
      where: { id, isBase: false, createdById: clientId },
    });
    return row ? EquipmentRepository.toModel(row) : null;
  }

  static async updateCustom(
    id: number,
    input: BaseEquipmentInput,
  ): Promise<void> {
    await prisma.equipment.update({ where: { id }, data: input });
  }

  static async deleteCustom(id: number): Promise<void> {
    // Kaskada na ClientEquipment uklanja i sponu vlasništva.
    await prisma.equipment.delete({ where: { id } });
  }
}
