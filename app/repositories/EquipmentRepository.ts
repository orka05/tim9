import "server-only";
import { prisma } from "../lib/prisma";
import { Equipment, type EquipmentType } from "../models/Equipment";
import type { Equipment as EquipmentRow } from "../generated/prisma/client";

type EquipmentCreateInput = {
  name: string;
  description: string;
  type: EquipmentType;
  clientId: number;
};

type EquipmentUpdateInput = {
  name: string;
  description: string;
  type: EquipmentType;
};

/** Repozitorijum za entitet Oprema. */
export class EquipmentRepository {
  private static toModel(row: EquipmentRow): Equipment {
    return new Equipment(
      row.id,
      row.name,
      row.description,
      row.type as EquipmentType,
      row.clientId,
    );
  }

  static async findByClient(clientId: number): Promise<Equipment[]> {
    const rows = await prisma.equipment.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => EquipmentRepository.toModel(row));
  }

  static async findOwnedById(
    id: number,
    clientId: number,
  ): Promise<Equipment | null> {
    const row = await prisma.equipment.findFirst({ where: { id, clientId } });
    return row ? EquipmentRepository.toModel(row) : null;
  }

  static async create(input: EquipmentCreateInput): Promise<void> {
    await prisma.equipment.create({ data: input });
  }

  static async update(id: number, input: EquipmentUpdateInput): Promise<void> {
    await prisma.equipment.update({ where: { id }, data: input });
  }

  static async delete(id: number): Promise<void> {
    await prisma.equipment.delete({ where: { id } });
  }
}
