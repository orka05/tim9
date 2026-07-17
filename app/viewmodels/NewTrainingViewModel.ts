import "server-only";
import {
  ExerciseRepository,
  type ExerciseOption,
} from "../repositories/ExerciseRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";

export type NewTrainingData = {
  client: { id: number; name: string };
  exercises: ExerciseOption[];
};

/** ViewModel za formu kreiranja novog treninga. */
export class NewTrainingViewModel {
  async load(
    trainerId: number,
    clientId: number,
  ): Promise<NewTrainingData | null> {
    const [client, exercises] = await Promise.all([
      TrainerRequestRepository.findAcceptedClient(trainerId, clientId),
      ExerciseRepository.findOptionsByTrainer(trainerId),
    ]);

    if (!client) return null;
    return { client, exercises };
  }
}
