import "server-only";
import { ClientRepository } from "../repositories/ClientRepository";
import { EquipmentRepository } from "../repositories/EquipmentRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";

export type ClientEquipmentItem = {
  id: number;
  name: string;
  description: string;
  type: string;
  isCustom: boolean;
};

export type ClientEquipmentForTrainer = {
  clientName: string;
  equipment: ClientEquipmentItem[];
};

/**
 * ViewModel: trener pregleda opremu klijenta koji mu je poslao zahtev.
 * Dozvoljeno samo ako između trenera i klijenta postoji aktivan zahtev
 * (PENDING ili ACCEPTED); u suprotnom vraća null.
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

    const equipment = await EquipmentRepository.findOwnedByClient(clientId);
    return {
      clientName: client.name,
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
