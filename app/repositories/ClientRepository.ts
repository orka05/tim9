import "server-only";
import { prisma } from "../lib/prisma";
import { Client } from "../models/Client";
import type { Client as ClientRow } from "../generated/prisma/client";

type ClientCreateInput = { name: string; email: string; password: string };
type ClientProfileInput = {
  name: string;
  email: string;
  password?: string;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
};

/** Repozitorijum za entitet Klijent. */
export class ClientRepository {
  private static toModel(row: ClientRow): Client {
    return new Client(
      row.id,
      row.name,
      row.email,
      row.password,
      row.createdAt,
      row.height,
      row.weight,
      row.age,
      row.rating,
    );
  }

  static async findByEmail(email: string): Promise<Client | null> {
    const row = await prisma.client.findUnique({ where: { email } });
    return row ? ClientRepository.toModel(row) : null;
  }

  static async findById(id: number): Promise<Client | null> {
    const row = await prisma.client.findUnique({ where: { id } });
    return row ? ClientRepository.toModel(row) : null;
  }

  static async create(input: ClientCreateInput): Promise<Client> {
    const row = await prisma.client.create({ data: input });
    return ClientRepository.toModel(row);
  }

  static async updateProfile(
    id: number,
    input: ClientProfileInput,
  ): Promise<void> {
    const { password, name, email, height, weight, age } = input;
    await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        height: height ?? null,
        weight: weight ?? null,
        age: age ?? null,
        ...(password ? { password } : {}),
      },
    });
  }
}
