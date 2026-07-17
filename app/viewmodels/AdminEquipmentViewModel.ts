import "server-only";
import { EquipmentRepository } from "../repositories/EquipmentRepository";

export type BaseEquipmentItem = {
  id: number;
  name: string;
  description: string;
  type: string;
};

/** ViewModel za admin katalog bazne opreme. */
export class AdminEquipmentViewModel {
  async getBaseCatalog(): Promise<BaseEquipmentItem[]> {
    const equipment = await EquipmentRepository.findAllBase();
    return equipment.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
    }));
  }
}
