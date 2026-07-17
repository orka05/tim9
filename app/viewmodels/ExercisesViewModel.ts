import "server-only";
import { ExerciseRepository } from "../repositories/ExerciseRepository";

export type ExerciseListItem = {
  id: number;
  name: string;
  description: string;
  category: string;
  videoPath: string | null;
};

/** ViewModel za stranicu vežbi (trener). */
export class ExercisesViewModel {
  async getForTrainer(trainerId: number): Promise<ExerciseListItem[]> {
    const exercises = await ExerciseRepository.findByTrainer(trainerId);
    return exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
      videoPath: exercise.videoPath,
    }));
  }
}
