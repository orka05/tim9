import "server-only";
import { TrainingRepository } from "../repositories/TrainingRepository";
import { TrainerReviewRepository } from "../repositories/TrainerReviewRepository";

/** Detalji treninga + ocena/komentar koje je klijent dao treneru (nezavisno od treninga). */
export type ClientTrainingDetailView = {
  id: number;
  title: string;
  scheduledFor: Date;
  trainingRating: number | null;
  trainingComment: string | null;
  trainer: { name: string; specialty: string; email: string };
  blocks: {
    id: number;
    sets: number;
    repetitions: number;
    restSeconds: number;
    notes: string;
    clientRating: number | null;
    exercise: { name: string; description: string; videoPath: string | null };
  }[];
  trainerRating: number | null;
  trainerComment: string | null;
};

/** ViewModel za detalje pojedinačnog treninga koji klijent gleda. */
export class MyTrainingDetailViewModel {
  async getForClient(
    trainingId: number,
    clientId: number,
  ): Promise<ClientTrainingDetailView | null> {
    const detail = await TrainingRepository.findClientTrainingDetail(
      trainingId,
      clientId,
    );
    if (!detail) return null;

    const review = await TrainerReviewRepository.findClientReview(
      detail.training.trainerId,
      clientId,
    );
    return {
      id: detail.training.id,
      title: detail.training.title,
      scheduledFor: detail.training.scheduledFor,
      trainingRating: detail.trainingRating,
      trainingComment: detail.trainingComment,
      trainer: detail.trainer,
      blocks: detail.blocks.map(({ block, exercise }) => ({
        id: block.id,
        sets: block.sets,
        repetitions: block.repetitions,
        restSeconds: block.restSeconds,
        notes: block.notes,
        clientRating: block.clientRating,
        exercise,
      })),
      trainerRating: review?.rating ?? null,
      trainerComment: review?.comment ?? null,
    };
  }
}
