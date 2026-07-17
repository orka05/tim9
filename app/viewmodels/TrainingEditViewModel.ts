import "server-only";
import {
  ExerciseRepository,
  type ExerciseOption,
} from "../repositories/ExerciseRepository";
import {
  TrainingRepository,
  type TrainingEditData,
} from "../repositories/TrainingRepository";

export type EditTrainingData = {
  training: TrainingEditData;
  exercises: ExerciseOption[];
};

/** ViewModel za formu izmene postojećeg treninga. */
export class TrainingEditViewModel {
  async load(
    trainingId: number,
    trainerId: number,
  ): Promise<EditTrainingData | null> {
    const [training, exercises] = await Promise.all([
      TrainingRepository.findForEdit(trainingId, trainerId),
      ExerciseRepository.findOptionsByTrainer(trainerId),
    ]);

    if (!training) return null;
    return { training, exercises };
  }
}
