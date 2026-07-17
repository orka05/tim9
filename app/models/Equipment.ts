export type EquipmentType = "SPRAVA" | "REKVIZIT";

/**
 * Domenski entitet Opreme.
 * `isBase` označava baznu opremu iz admin kataloga; custom opremu pravi klijent
 * (`createdById`). Vlasništvo se modeluje kroz `ClientEquipment` spojnu tabelu.
 */
export class Equipment {
  constructor(
    public readonly id: number,
    public name: string,
    public description: string,
    public type: EquipmentType,
    public readonly isBase: boolean,
    public readonly createdById: number | null,
  ) {}

  /** Da li je oprema custom (napravio je klijent), a ne bazna iz kataloga. */
  isCustom(): boolean {
    return !this.isBase && this.createdById !== null;
  }
}
