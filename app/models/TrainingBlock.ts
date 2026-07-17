/** Domenski entitet bloka treninga (jedna vežba u okviru treninga). */
export class TrainingBlock {
  constructor(
    public readonly id: number,
    public readonly trainingId: number,
    public readonly exerciseId: number,
    public position: number,
    public sets: number,
    public repetitions: number,
    public restSeconds: number,
    public notes: string,
    public clientRating: number | null,
  ) {}

  isRated(): boolean {
    return this.clientRating !== null;
  }
}
