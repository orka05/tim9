export type TrainerRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

/** Domenski entitet Zahteva klijenta upućenog treneru. */
export class TrainerRequest {
  constructor(
    public readonly id: number,
    public message: string,
    public status: TrainerRequestStatus,
    public readonly clientId: number,
    public readonly trainerId: number,
    public readonly createdAt: Date,
    public respondedAt: Date | null,
  ) {}

  isPending(): boolean {
    return this.status === "PENDING";
  }

  isAccepted(): boolean {
    return this.status === "ACCEPTED";
  }
}
