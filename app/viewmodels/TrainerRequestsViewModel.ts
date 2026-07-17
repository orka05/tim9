import "server-only";
import {
  TrainerRequestRepository,
  type TrainerRequestWithClient,
} from "../repositories/TrainerRequestRepository";

/** ViewModel za početnu stranicu trenera (pristigli zahtevi klijenata). */
export class TrainerRequestsViewModel {
  async getForTrainer(trainerId: number): Promise<TrainerRequestWithClient[]> {
    return TrainerRequestRepository.findByTrainerWithClient(trainerId);
  }
}
