import "server-only";
import { TrainerRepository } from "../repositories/TrainerRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";
import { TrainerReviewRepository } from "../repositories/TrainerReviewRepository";

export type ClientHomeReview = {
  clientName: string;
  rating: number;
  comment: string | null;
  date: string;
};

export type ClientHomeTrainer = {
  id: number;
  name: string;
  specialty: string;
  city: string;
  pricePerMonth: number;
  rating: string;
  requestStatus: "PENDING" | "ACCEPTED" | null;
  reviews: ClientHomeReview[];
};

/** ViewModel za početnu stranicu klijenta (izbor trenera). */
export class ClientHomeViewModel {
  async getTrainers(clientId: number): Promise<ClientHomeTrainer[]> {
    const [trainers, statuses] = await Promise.all([
      TrainerRepository.findActiveOrderedByRating(),
      TrainerRequestRepository.activeStatusesForClient(clientId),
    ]);

    const reviews = await TrainerReviewRepository.findByTrainers(
      trainers.map((trainer) => trainer.id),
    );
    const reviewsByTrainer = new Map<number, ClientHomeReview[]>();
    for (const review of reviews) {
      const list = reviewsByTrainer.get(review.trainerId) ?? [];
      list.push({
        clientName: review.clientName,
        rating: review.rating,
        comment: review.comment,
        date: review.updatedAt.toLocaleDateString("sr-Latn-RS", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      });
      reviewsByTrainer.set(review.trainerId, list);
    }

    return trainers.map((trainer) => {
      const status = statuses.get(trainer.id);
      return {
        id: trainer.id,
        name: trainer.name,
        specialty: trainer.specialty,
        city: trainer.city,
        pricePerMonth: trainer.pricePerMonth,
        rating: trainer.formattedRating,
        requestStatus: status === "ACCEPTED" || status === "PENDING" ? status : null,
        reviews: reviewsByTrainer.get(trainer.id) ?? [],
      };
    });
  }
}
