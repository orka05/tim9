import "server-only";
import { prisma } from "../lib/prisma";

/** Repozitorijum za entitet Blok treninga (TrainingBlock). */
export class TrainingBlockRepository {
  static async findWithClientId(
    blockId: number,
  ): Promise<{ id: number; trainingId: number; clientId: number } | null> {
    const block = await prisma.trainingBlock.findFirst({
      where: { id: blockId },
      select: {
        id: true,
        trainingId: true,
        training: { select: { clientId: true } },
      },
    });
    if (!block) return null;
    return {
      id: block.id,
      trainingId: block.trainingId,
      clientId: block.training.clientId,
    };
  }

  static async setRating(blockId: number, rating: number): Promise<void> {
    await prisma.trainingBlock.update({
      where: { id: blockId },
      data: { clientRating: rating },
    });
  }
}
