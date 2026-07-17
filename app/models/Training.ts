/** Domenski entitet Treninga koji trener kreira za klijenta. */
export class Training {
  constructor(
    public readonly id: number,
    public title: string,
    public scheduledFor: Date,
    public readonly trainerId: number,
    public readonly clientId: number,
  ) {}
}
