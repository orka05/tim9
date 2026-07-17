import "server-only";
import {
  TrainingRepository,
  type ClientTrainingDetail,
} from "../repositories/TrainingRepository";
import { TrainerReviewRepository } from "../repositories/TrainerReviewRepository";

/** Detalji treninga + ocena/komentar koje je klijent dao treneru (nezavisno od treninga). */
export type ClientTrainingDetailView = ClientTrainingDetail & {
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
      detail.trainerId,
      clientId,
    );
    return {
      ...detail,
      trainerRating: review?.rating ?? null,
      trainerComment: review?.comment ?? null,
    };
  }
}
