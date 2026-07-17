import "server-only";
import { prisma } from "../lib/prisma";
import { TrainerReview } from "../models/TrainerReview";

/**
 * Repozitorijum za ocene trenera (TrainerReview).
 * Ocena (i opcioni komentar) je jedna po paru (klijent, trener) — nezavisna od
 * treninga. Prosečna ocena trenera (`Trainer.rating`) se preračunava pri svakoj oceni.
 */
export class TrainerReviewRepository {
  /**
   * Klijent ocenjuje trenera (uz opcioni komentar) u kontekstu svog treninga.
   * Trener se izvodi iz treninga (uz proveru vlasništva), ocena je 1 po klijentu.
   * Vraća false ako trening ne pripada klijentu.
   */
  static async rateViaTraining(
    trainingId: number,
    clientId: number,
    rating: number,
    comment: string | null,
  ): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const training = await tx.training.findFirst({
        where: { id: trainingId, clientId },
        select: { trainerId: true },
      });
      if (!training) return false;

      await tx.trainerReview.upsert({
        where: {
          trainerId_clientId: { trainerId: training.trainerId, clientId },
        },
        create: { trainerId: training.trainerId, clientId, rating, comment },
        update: { rating, comment },
      });

      const aggregate = await tx.trainerReview.aggregate({
        where: { trainerId: training.trainerId },
        _avg: { rating: true },
      });

      await tx.trainer.update({
        where: { id: training.trainerId },
        data: { rating: aggregate._avg.rating ?? 1.0 },
      });

      return true;
    });
  }

  /** Ocena (domenski model) koju je klijent dao treneru, ili null. */
  static async findClientReview(
    trainerId: number,
    clientId: number,
  ): Promise<TrainerReview | null> {
    const row = await prisma.trainerReview.findUnique({
      where: { trainerId_clientId: { trainerId, clientId } },
    });
    return row
      ? new TrainerReview(
          row.id,
          row.trainerId,
          row.clientId,
          row.rating,
          row.comment,
          row.createdAt,
          row.updatedAt,
        )
      : null;
  }

  /** Sve ocene (sa opcionim komentarima) za date trenere, najnovije prve. */
  static async findByTrainers(
    trainerIds: number[],
  ): Promise<TrainerReviewItem[]> {
    if (trainerIds.length === 0) return [];
    const rows = await prisma.trainerReview.findMany({
      where: { trainerId: { in: trainerIds } },
      orderBy: { updatedAt: "desc" },
      select: {
        trainerId: true,
        rating: true,
        comment: true,
        updatedAt: true,
        client: { select: { name: true } },
      },
    });
    return rows.map((row) => ({
      trainerId: row.trainerId,
      clientName: row.client.name,
      rating: row.rating,
      comment: row.comment,
      updatedAt: row.updatedAt,
    }));
  }
}

/** Ocena trenera za javni prikaz (ko je ocenio, ocena, komentar). */
export type TrainerReviewItem = {
  trainerId: number;
  clientName: string;
  rating: number;
  comment: string | null;
  updatedAt: Date;
};
