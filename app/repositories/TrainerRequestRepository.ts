import "server-only";
import { prisma } from "../lib/prisma";
import {
  TrainerRequest,
  type TrainerRequestStatus,
} from "../models/TrainerRequest";

/** Zahtev (kao domenska instanca) zajedno sa podacima klijenta koji ga je poslao. */
export type TrainerRequestWithClient = {
  request: TrainerRequest;
  clientName: string;
  clientEmail: string;
  clientRating: number;
};

type TrainerRequestCreateInput = {
  clientId: number;
  trainerId: number;
  message: string;
};

/** Repozitorijum za entitet Zahtev (TrainerRequest). */
export class TrainerRequestRepository {
  static async findActiveStatusBetween(
    clientId: number,
    trainerId: number,
  ): Promise<TrainerRequestStatus | null> {
    const request = await prisma.trainerRequest.findFirst({
      where: { clientId, trainerId, status: { in: ["PENDING", "ACCEPTED"] } },
      select: { status: true },
      orderBy: { status: "desc" },
    });
    return (request?.status as TrainerRequestStatus) ?? null;
  }

  static async create(input: TrainerRequestCreateInput): Promise<void> {
    await prisma.trainerRequest.create({ data: input });
  }

  static async hasAccepted(
    trainerId: number,
    clientId: number,
  ): Promise<boolean> {
    const request = await prisma.trainerRequest.findFirst({
      where: { trainerId, clientId, status: "ACCEPTED" },
      select: { id: true },
    });
    return request !== null;
  }

  static async findByTrainerWithClient(
    trainerId: number,
  ): Promise<TrainerRequestWithClient[]> {
    const rows = await prisma.trainerRequest.findMany({
      where: { trainerId },
      include: { client: { select: { name: true, email: true, rating: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((row) => ({
      request: new TrainerRequest(
        row.id,
        row.message,
        row.status as TrainerRequestStatus,
        row.clientId,
        row.trainerId,
        row.createdAt,
        row.respondedAt,
      ),
      clientName: row.client.name,
      clientEmail: row.client.email,
      clientRating: row.client.rating,
    }));
  }

  /** Aktivni statusi zahteva ovog klijenta po treneru (ACCEPTED ima prioritet). */
  static async activeStatusesForClient(
    clientId: number,
  ): Promise<Map<number, TrainerRequestStatus>> {
    const rows = await prisma.trainerRequest.findMany({
      where: { clientId, status: { in: ["PENDING", "ACCEPTED"] } },
      select: { trainerId: true, status: true },
    });
    const map = new Map<number, TrainerRequestStatus>();
    for (const row of rows) {
      if (map.get(row.trainerId) === "ACCEPTED") continue;
      map.set(row.trainerId, row.status as TrainerRequestStatus);
    }
    return map;
  }

  static async respondPending(
    requestId: number,
    trainerId: number,
    decision: "ACCEPTED" | "REJECTED",
  ): Promise<void> {
    await prisma.trainerRequest.updateMany({
      where: { id: requestId, trainerId, status: "PENDING" },
      data: { status: decision, respondedAt: new Date() },
    });
  }

  /** Klijent (id, ime) koji je prihvatio saradnju sa datim trenerom, ili null. */
  static async findAcceptedClient(
    trainerId: number,
    clientId: number,
  ): Promise<{ id: number; name: string } | null> {
    const request = await prisma.trainerRequest.findFirst({
      where: { trainerId, clientId, status: "ACCEPTED" },
      select: { client: { select: { id: true, name: true } } },
    });
    return request?.client ?? null;
  }
}
