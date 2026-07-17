import "server-only";
import {
  TrainingRepository,
  type TrainerTrainingSummary,
} from "../repositories/TrainingRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";

/** ViewModel za pregled treninga koje je trener kreirao (opciono filtriran po klijentu). */
export class TrainerTrainingsViewModel {
  async getSelectedClient(
    trainerId: number,
    clientId: number,
  ): Promise<{ id: number; name: string } | null> {
    return TrainerRequestRepository.findAcceptedClient(trainerId, clientId);
  }

  async getTrainings(
    trainerId: number,
    clientId?: number,
  ): Promise<TrainerTrainingSummary[]> {
    return TrainingRepository.findTrainerTrainings(trainerId, clientId);
  }
}
