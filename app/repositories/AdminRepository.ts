import "server-only";
import { prisma } from "../lib/prisma";
import { Admin } from "../models/Admin";
import type { Admin as AdminRow } from "../generated/prisma/client";

type AdminProfileInput = { name: string; email: string; password?: string };

/** Repozitorijum za entitet Administrator. */
export class AdminRepository {
  private static toModel(row: AdminRow): Admin {
    return new Admin(row.id, row.name, row.email, row.password, row.createdAt);
  }

  static async findByEmail(email: string): Promise<Admin | null> {
    const row = await prisma.admin.findUnique({ where: { email } });
    return row ? AdminRepository.toModel(row) : null;
  }

  static async findById(id: number): Promise<Admin | null> {
    const row = await prisma.admin.findUnique({ where: { id } });
    return row ? AdminRepository.toModel(row) : null;
  }

  static async updateProfile(
    id: number,
    input: AdminProfileInput,
  ): Promise<void> {
    const { password, name, email } = input;
    await prisma.admin.update({
      where: { id },
      data: { name, email, ...(password ? { password } : {}) },
    });
  }
}
