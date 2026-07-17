import "server-only";
import { TrainerRepository } from "../repositories/TrainerRepository";
import { TrainerReviewRepository } from "../repositories/TrainerReviewRepository";

const PAGE_SIZE = 10;

export type TrainerReviewView = {
  clientName: string;
  rating: number;
  comment: string | null;
  date: string;
};

export type TrainerSearchItem = {
  id: number;
  name: string;
  specialty: string;
  city: string;
  pricePerMonth: number;
  rating: string;
  reviews: TrainerReviewView[];
};

export type TrainerSearchResult = {
  trainers: TrainerSearchItem[];
  total: number;
  totalPages: number;
  currentPage: number;
};

/** ViewModel za pretragu trenera (javna stranica /trainers). */
export class TrainersSearchViewModel {
  async search(
    q: string,
    city: string,
    page: number,
  ): Promise<TrainerSearchResult> {
    const total = await TrainerRepository.countActiveMatching(q, city);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, page || 1), totalPages);

    const trainers = await TrainerRepository.searchActive(
      q,
      city,
      (currentPage - 1) * PAGE_SIZE,
      PAGE_SIZE,
    );

    const reviews = await TrainerReviewRepository.findByTrainers(
      trainers.map((trainer) => trainer.id),
    );
    const reviewsByTrainer = new Map<number, TrainerReviewView[]>();
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

    return {
      trainers: trainers.map((trainer) => ({
        id: trainer.id,
        name: trainer.name,
        specialty: trainer.specialty,
        city: trainer.city,
        pricePerMonth: trainer.pricePerMonth,
        rating: trainer.formattedRating,
        reviews: reviewsByTrainer.get(trainer.id) ?? [],
      })),
      total,
      totalPages,
      currentPage,
    };
  }
}
