export type TrainerStatus = "PENDING" | "ACTIVE" | "BANNED";

/**
 * Domenski entitet Trenera (Model sloj).
 * Sadrži atribute i poslovnu/prezentacionu logiku vezanu za trenera,
 * nezavisno od načina čuvanja u bazi (to je posao repozitorijuma).
 */
export class Trainer {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public password: string,
    public specialty: string,
    public city: string,
    public pricePerSession: number,
    public rating: number,
    public status: TrainerStatus,
  ) {}

  isActive(): boolean {
    return this.status === "ACTIVE";
  }

  get displaySpecialty(): string {
    return this.specialty || "Trener";
  }

  get displayLocation(): string {
    return this.city ? ` · ${this.city}` : "";
  }

  get formattedRating(): string {
    return this.rating.toFixed(1);
  }
}
