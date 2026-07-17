import "server-only";
import {
  TrainingRepository,
  type ClientTrainingDetail,
} from "../repositories/TrainingRepository";

/** ViewModel za detalje pojedinačnog treninga koji klijent gleda. */
export class MyTrainingDetailViewModel {
  async getForClient(
    trainingId: number,
    clientId: number,
  ): Promise<ClientTrainingDetail | null> {
    return TrainingRepository.findClientTrainingDetail(trainingId, clientId);
  }
}
