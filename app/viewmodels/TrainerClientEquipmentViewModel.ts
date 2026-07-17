import "server-only";
import { ClientRepository } from "../repositories/ClientRepository";
import { EquipmentRepository } from "../repositories/EquipmentRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";
import { ClientReviewRepository } from "../repositories/ClientReviewRepository";

export type ClientEquipmentItem = {
  id: number;
  name: string;
  description: string;
  type: string;
  isCustom: boolean;
};

export type ClientReviewView = {
  trainerName: string;
  rating: number;
  comment: string | null;
  date: string;
};

export type ClientEquipmentForTrainer = {
  clientName: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  clientRating: number;
  reviewCount: number;
  canRate: boolean;
  myRating: number | null;
  myComment: string | null;
  reviews: ClientReviewView[];
  equipment: ClientEquipmentItem[];
};

/**
 * ViewModel: trener pregleda podatke, opremu i ocene klijenta koji mu je poslao
 * zahtev. Dozvoljeno samo ako između trenera i klijenta postoji aktivan zahtev
 * (PENDING ili ACCEPTED); ocenjivanje je moguće samo za ACCEPTED saradnju.
 */
export class TrainerClientEquipmentViewModel {
  async load(
    trainerId: number,
    clientId: number,
  ): Promise<ClientEquipmentForTrainer | null> {
    const status = await TrainerRequestRepository.findActiveStatusBetween(
      clientId,
      trainerId,
    );
    if (!status) return null;

    const client = await ClientRepository.findById(clientId);
    if (!client) return null;

    const [equipment, myReview, reviews] = await Promise.all([
      EquipmentRepository.findOwnedByClient(clientId),
      ClientReviewRepository.findTrainerReview(trainerId, clientId),
      ClientReviewRepository.findByClient(clientId),
    ]);

    return {
      clientName: client.name,
      height: client.height,
      weight: client.weight,
      age: client.age,
      clientRating: client.rating,
      reviewCount: reviews.length,
      canRate: status === "ACCEPTED",
      myRating: myReview?.rating ?? null,
      myComment: myReview?.comment ?? null,
      reviews: reviews.map((review) => ({
        trainerName: review.trainerName,
        rating: review.rating,
        comment: review.comment,
        date: review.updatedAt.toLocaleDateString("sr-Latn-RS", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      })),
      equipment: equipment.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        isCustom: item.isCustom,
      })),
    };
  }
}
