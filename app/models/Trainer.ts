import { User } from "./User";

export type TrainerStatus = "PENDING" | "ACTIVE" | "BANNED";

/**
 * Domenski entitet Trenera (Model sloj).
 * Nasleđuje zajedničke atribute iz apstraktne klase `User`, a dodaje
 * poslovnu/prezentacionu logiku i atribute specifične za trenera.
 */
export class Trainer extends User {
  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    public specialty: string,
    public city: string,
    public pricePerMonth: number,
    public rating: number,
    public status: TrainerStatus,
  ) {
    super(id, name, email, password);
  }

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
