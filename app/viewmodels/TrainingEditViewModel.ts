import "server-only";
import {
  ExerciseRepository,
  type ExerciseOption,
} from "../repositories/ExerciseRepository";
import { TrainingRepository } from "../repositories/TrainingRepository";

export type EditTrainingData = {
  training: {
    id: number;
    title: string;
    scheduledFor: Date;
    client: { id: number; name: string };
    blocks: {
      exerciseId: number;
      sets: number;
      repetitions: number;
      restSeconds: number;
      notes: string;
    }[];
  };
  exercises: ExerciseOption[];
};

/** ViewModel za formu izmene postojećeg treninga. */
export class TrainingEditViewModel {
  async load(
    trainingId: number,
    trainerId: number,
  ): Promise<EditTrainingData | null> {
    const [data, exercises] = await Promise.all([
      TrainingRepository.findForEdit(trainingId, trainerId),
      ExerciseRepository.findOptionsByTrainer(trainerId),
    ]);

    if (!data) return null;
    return {
      training: {
        id: data.training.id,
        title: data.training.title,
        scheduledFor: data.training.scheduledFor,
        client: data.client,
        blocks: data.blocks,
      },
      exercises,
    };
  }
}
