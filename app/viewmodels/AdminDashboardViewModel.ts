import "server-only";
import { TrainerRepository } from "../repositories/TrainerRepository";

/**
 * Podaci pripremljeni za prikaz (View) — bez domenske logike i bez Prisma tipova.
 */
export type TrainerListItem = {
  id: number;
  rank: number;
  name: string;
  specialty: string;
  location: string;
  rating: string;
};

export type PendingTrainerItem = {
  id: number;
  name: string;
  email: string;
};

export type BannedTrainerItem = {
  id: number;
  name: string;
  email: string;
  specialty: string;
};

/**
 * ViewModel sloj — posreduje između View-a (stranice) i repozitorijuma.
 * View poziva ViewModel, ViewModel koristi repozitorijum i vraća podatke
 * spremne za renderovanje.
 */
export class AdminDashboardViewModel {
  async getActiveTrainers(): Promise<TrainerListItem[]> {
    const trainers = await TrainerRepository.findActiveOrderedByRating();

    return trainers.map((trainer, index) => ({
      id: trainer.id,
      rank: index + 1,
      name: trainer.name,
      specialty: trainer.displaySpecialty,
      location: trainer.displayLocation,
      rating: trainer.formattedRating,
    }));
  }

  async getPendingTrainers(): Promise<PendingTrainerItem[]> {
    const trainers = await TrainerRepository.findPending();
    return trainers.map((trainer) => ({
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
    }));
  }

  async getBannedTrainers(): Promise<BannedTrainerItem[]> {
    const trainers = await TrainerRepository.findBanned();
    return trainers.map((trainer) => ({
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      specialty: trainer.specialty,
    }));
  }
}
