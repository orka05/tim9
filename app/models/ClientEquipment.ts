/**
 * Spona (asocijativna klasa): klijent poseduje opremu — baznu iz kataloga ili
 * sopstvenu custom. Modeluje vezu više-na-više između Klijenta i Opreme.
 */
export class ClientEquipment {
  constructor(
    public readonly clientId: number,
    public readonly equipmentId: number,
    public readonly createdAt: Date,
  ) {}
}
