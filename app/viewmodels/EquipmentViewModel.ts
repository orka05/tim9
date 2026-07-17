import "server-only";
import { EquipmentRepository } from "../repositories/EquipmentRepository";

export type OwnedEquipmentItem = {
  id: number;
  name: string;
  description: string;
  type: string;
  isCustom: boolean;
};

export type CatalogEquipmentItem = {
  id: number;
  name: string;
  description: string;
  type: string;
};

export type ClientEquipmentData = {
  owned: OwnedEquipmentItem[];
  catalog: CatalogEquipmentItem[];
};

/** ViewModel za stranicu opreme (klijent): moja oprema + katalog za dodavanje. */
export class EquipmentViewModel {
  async getForClient(clientId: number): Promise<ClientEquipmentData> {
    const [owned, catalog] = await Promise.all([
      EquipmentRepository.findOwnedByClient(clientId),
      EquipmentRepository.findBaseNotOwnedByClient(clientId),
    ]);

    return {
      owned: owned.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        isCustom: item.isCustom,
      })),
      catalog: catalog.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
      })),
    };
  }
}
