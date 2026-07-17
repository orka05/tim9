/**
 * Domenski entitet: ocena i (opcioni) komentar koje je trener dao klijentu
 * (kakav je bio u saradnji). Jedna po paru (trener, klijent).
 */
export class ClientReview {
  constructor(
    public readonly id: number,
    public readonly clientId: number,
    public readonly trainerId: number,
    public rating: number,
    public comment: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /** Da li ocena sadrži i tekstualni komentar. */
  hasComment(): boolean {
    return this.comment !== null && this.comment.trim().length > 0;
  }
}
