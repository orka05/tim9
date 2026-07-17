import "server-only";
import { prisma } from "../lib/prisma";
import { ClientReview } from "../models/ClientReview";

/** Ocena klijenta za prikaz (koji trener je ocenio, ocena, komentar). */
export type ClientReviewItem = {
  trainerName: string;
  rating: number;
  comment: string | null;
  updatedAt: Date;
};

/**
 * Repozitorijum za ocene klijenata (ClientReview).
 * Trener ocenjuje klijenta (kakav je bio u saradnji) — jedna ocena po paru
 * (trener, klijent). Prosečna ocena klijenta (`Client.rating`) = AVG(rating).
 */
export class ClientReviewRepository {
  /**
   * Trener ocenjuje klijenta kog trenira (mora postojati prihvaćena saradnja).
   * Vraća false ako trener nema prihvaćen zahtev tog klijenta.
   */
  static async rate(
    trainerId: number,
    clientId: number,
    rating: number,
    comment: string | null,
  ): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const accepted = await tx.trainerRequest.findFirst({
        where: { trainerId, clientId, status: "ACCEPTED" },
        select: { id: true },
      });
      if (!accepted) return false;

      await tx.clientReview.upsert({
        where: { trainerId_clientId: { trainerId, clientId } },
        create: { trainerId, clientId, rating, comment },
        update: { rating, comment },
      });

      const aggregate = await tx.clientReview.aggregate({
        where: { clientId },
        _avg: { rating: true },
      });

      await tx.client.update({
        where: { id: clientId },
        data: { rating: aggregate._avg.rating ?? 0 },
      });

      return true;
    });
  }

  /** Ocena (domenski model) koju je trener dao klijentu, ili null. */
  static async findTrainerReview(
    trainerId: number,
    clientId: number,
  ): Promise<ClientReview | null> {
    const row = await prisma.clientReview.findUnique({
      where: { trainerId_clientId: { trainerId, clientId } },
    });
    return row
      ? new ClientReview(
          row.id,
          row.clientId,
          row.trainerId,
          row.rating,
          row.comment,
          row.createdAt,
          row.updatedAt,
        )
      : null;
  }

  /** Sve ocene (sa opcionim komentarima) za datog klijenta, najnovije prve. */
  static async findByClient(clientId: number): Promise<ClientReviewItem[]> {
    const rows = await prisma.clientReview.findMany({
      where: { clientId },
      orderBy: { updatedAt: "desc" },
      select: {
        rating: true,
        comment: true,
        updatedAt: true,
        trainer: { select: { name: true } },
      },
    });
    return rows.map((row) => ({
      trainerName: row.trainer.name,
      rating: row.rating,
      comment: row.comment,
      updatedAt: row.updatedAt,
    }));
  }
}
