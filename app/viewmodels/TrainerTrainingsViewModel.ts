import "server-only";
import { TrainingRepository } from "../repositories/TrainingRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";

/** Trening pripremljen za prikaz u listi trenerovih treninga. */
export type TrainerTrainingView = {
  id: number;
  title: string;
  scheduledFor: Date;
  clientId: number;
  trainingRating: number | null;
  trainingComment: string | null;
  client: { name: string; email: string };
  blocks: {
    id: number;
    sets: number;
    repetitions: number;
    restSeconds: number;
    notes: string;
    clientRating: number | null;
    exercise: { name: string };
  }[];
};

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
  ): Promise<TrainerTrainingView[]> {
    const rows = await TrainingRepository.findTrainerTrainings(
      trainerId,
      clientId,
    );
    return rows.map((row) => ({
      id: row.training.id,
      title: row.training.title,
      scheduledFor: row.training.scheduledFor,
      clientId: row.training.clientId,
      trainingRating: row.trainingRating,
      trainingComment: row.trainingComment,
      client: row.client,
      blocks: row.blocks.map(({ block, exerciseName }) => ({
        id: block.id,
        sets: block.sets,
        repetitions: block.repetitions,
        restSeconds: block.restSeconds,
        notes: block.notes,
        clientRating: block.clientRating,
        exercise: { name: exerciseName },
      })),
    }));
  }
}
