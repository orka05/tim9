import "server-only";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";
import type { TrainerRequestStatus } from "../models/TrainerRequest";

/** Podaci o pristiglom zahtevu, pripremljeni za prikaz na početnoj strani trenera. */
export type TrainerRequestView = {
  id: number;
  message: string;
  status: TrainerRequestStatus;
  createdAt: Date;
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientRating: number;
};

/** ViewModel za početnu stranicu trenera (pristigli zahtevi klijenata). */
export class TrainerRequestsViewModel {
  async getForTrainer(trainerId: number): Promise<TrainerRequestView[]> {
    const rows = await TrainerRequestRepository.findByTrainerWithClient(
      trainerId,
    );
    return rows.map(({ request, clientName, clientEmail, clientRating }) => ({
      id: request.id,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      clientId: request.clientId,
      clientName,
      clientEmail,
      clientRating,
    }));
  }
}
