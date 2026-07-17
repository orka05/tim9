import "server-only";
import { prisma } from "../lib/prisma";
import { Trainer, type TrainerStatus } from "../models/Trainer";
import type {
  Trainer as TrainerRow,
  Prisma,
} from "../generated/prisma/client";

type TrainerCreateInput = { name: string; email: string; password: string };

type TrainerProfileInput = {
  name: string;
  email: string;
  specialty: string;
  city: string;
  pricePerSession: number;
  password?: string;
};

/**
 * Repository sloj — jedino mesto koje priča sa bazom (Prisma) za entitet Trener.
 * Vraća instance domenske klase `Trainer`, a ne sirove Prisma zapise.
 */
export class TrainerRepository {
  private static toModel(row: TrainerRow): Trainer {
    return new Trainer(
      row.id,
      row.name,
      row.email,
      row.password,
      row.specialty,
      row.city,
      row.pricePerSession,
      row.rating,
      row.status as TrainerStatus,
    );
  }

  static async findByEmail(email: string): Promise<Trainer | null> {
    const row = await prisma.trainer.findUnique({ where: { email } });
    return row ? TrainerRepository.toModel(row) : null;
  }

  static async findById(id: number): Promise<Trainer | null> {
    const row = await prisma.trainer.findUnique({ where: { id } });
    return row ? TrainerRepository.toModel(row) : null;
  }

  static async create(input: TrainerCreateInput): Promise<Trainer> {
    const row = await prisma.trainer.create({ data: input });
    return TrainerRepository.toModel(row);
  }

  static async updateProfile(
    id: number,
    input: TrainerProfileInput,
  ): Promise<void> {
    const { password, ...rest } = input;
    await prisma.trainer.update({
      where: { id },
      data: { ...rest, ...(password ? { password } : {}) },
    });
  }

  static async findActiveOrderedByRating(): Promise<Trainer[]> {
    const rows = await prisma.trainer.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ rating: "desc" }, { name: "asc" }],
    });
    return rows.map((row) => TrainerRepository.toModel(row));
  }

  private static searchWhere(q: string, city: string): Prisma.TrainerWhereInput {
    const where: Prisma.TrainerWhereInput = { status: "ACTIVE" };
    if (q.trim()) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { specialty: { contains: q, mode: "insensitive" } },
      ];
    }
    if (city) where.city = city;
    return where;
  }

  static async countActiveMatching(q: string, city: string): Promise<number> {
    return prisma.trainer.count({ where: TrainerRepository.searchWhere(q, city) });
  }

  static async searchActive(
    q: string,
    city: string,
    skip: number,
    take: number,
  ): Promise<Trainer[]> {
    const rows = await prisma.trainer.findMany({
      where: TrainerRepository.searchWhere(q, city),
      orderBy: [{ rating: "desc" }, { name: "asc" }],
      skip,
      take,
    });
    return rows.map((row) => TrainerRepository.toModel(row));
  }

  static async findPending(): Promise<Trainer[]> {
    const rows = await prisma.trainer.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => TrainerRepository.toModel(row));
  }

  static async findBanned(): Promise<Trainer[]> {
    const rows = await prisma.trainer.findMany({
      where: { status: "BANNED" },
      orderBy: { name: "asc" },
    });
    return rows.map((row) => TrainerRepository.toModel(row));
  }

  static async ban(id: number): Promise<void> {
    await prisma.trainer.updateMany({
      where: { id },
      data: { status: "BANNED" },
    });
  }

  static async approve(id: number): Promise<void> {
    await prisma.trainer.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "ACTIVE" },
    });
  }

  static async activate(id: number): Promise<void> {
    await prisma.trainer.updateMany({
      where: { id, status: "BANNED" },
      data: { status: "ACTIVE" },
    });
  }

  static async findAcceptedForClient(
    clientId: number,
  ): Promise<ClientTrainerRow[]> {
    return prisma.trainer.findMany({
      where: { requests: { some: { clientId, status: "ACCEPTED" } } },
      select: {
        id: true,
        name: true,
        specialty: true,
        city: true,
        rating: true,
        trainings: {
          where: { clientId },
          select: { id: true, title: true, scheduledFor: true },
          orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
        },
      },
      orderBy: { name: "asc" },
    });
  }
}

export type ClientTrainerRow = {
  id: number;
  name: string;
  specialty: string;
  city: string;
  rating: number;
  trainings: { id: number; title: string; scheduledFor: Date }[];
};
