import "server-only";
import { TrainerRepository } from "../repositories/TrainerRepository";

export type MyTrainerTraining = {
  id: number;
  title: string;
  scheduledFor: Date;
};

export type MyTrainerCard = {
  id: number;
  name: string;
  specialty: string;
  city: string;
  rating: string;
  trainings: MyTrainerTraining[];
};

/** ViewModel za stranicu "Moji treneri" (klijent vidi trenere i njihove treninge). */
export class MyTrainersViewModel {
  async getForClient(clientId: number): Promise<MyTrainerCard[]> {
    const trainers = await TrainerRepository.findAcceptedForClient(clientId);

    return trainers.map((trainer) => ({
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      city: trainer.city,
      rating: trainer.rating.toFixed(1),
      trainings: trainer.trainings,
    }));
  }
}
