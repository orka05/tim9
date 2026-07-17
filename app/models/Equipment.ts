export type EquipmentType = "SPRAVA" | "REKVIZIT";

/** Domenski entitet Opreme iz klijentovog inventara. */
export class Equipment {
  constructor(
    public readonly id: number,
    public name: string,
    public description: string,
    public type: EquipmentType,
    public readonly clientId: number,
  ) {}
}
