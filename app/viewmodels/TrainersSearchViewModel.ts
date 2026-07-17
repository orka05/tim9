import "server-only";
import { TrainerRepository } from "../repositories/TrainerRepository";

const PAGE_SIZE = 10;

export type TrainerSearchItem = {
  id: number;
  name: string;
  specialty: string;
  city: string;
  pricePerSession: number;
  rating: string;
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

    return {
      trainers: trainers.map((trainer) => ({
        id: trainer.id,
        name: trainer.name,
        specialty: trainer.specialty,
        city: trainer.city,
        pricePerSession: trainer.pricePerSession,
        rating: trainer.formattedRating,
      })),
      total,
      totalPages,
      currentPage,
    };
  }
}
