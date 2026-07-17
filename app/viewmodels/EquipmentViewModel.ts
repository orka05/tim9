import "server-only";
import { EquipmentRepository } from "../repositories/EquipmentRepository";

export type EquipmentListItem = {
  id: number;
  name: string;
  description: string;
  type: string;
};

/** ViewModel za stranicu opreme (klijent). */
export class EquipmentViewModel {
  async getForClient(clientId: number): Promise<EquipmentListItem[]> {
    const equipment = await EquipmentRepository.findByClient(clientId);
    return equipment.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
    }));
  }
}
