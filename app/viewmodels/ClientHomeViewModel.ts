import "server-only";
import { TrainerRepository } from "../repositories/TrainerRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";

export type ClientHomeTrainer = {
  id: number;
  name: string;
  specialty: string;
  city: string;
  pricePerSession: number;
  rating: string;
  requestStatus: "PENDING" | "ACCEPTED" | null;
};

/** ViewModel za početnu stranicu klijenta (izbor trenera). */
export class ClientHomeViewModel {
  async getTrainers(clientId: number): Promise<ClientHomeTrainer[]> {
    const [trainers, statuses] = await Promise.all([
      TrainerRepository.findActiveOrderedByRating(),
      TrainerRequestRepository.activeStatusesForClient(clientId),
    ]);

    return trainers.map((trainer) => {
      const status = statuses.get(trainer.id);
      return {
        id: trainer.id,
        name: trainer.name,
        specialty: trainer.specialty,
        city: trainer.city,
        pricePerSession: trainer.pricePerSession,
        rating: trainer.formattedRating,
        requestStatus: status === "ACCEPTED" || status === "PENDING" ? status : null,
      };
    });
  }
}
