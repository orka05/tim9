export type ExerciseCategory = "SPRAVA" | "REKVIZIT" | "BODYWEIGHT";

/** Domenski entitet Vežbe iz trenerovog skupa. */
export class Exercise {
  constructor(
    public readonly id: number,
    public name: string,
    public description: string,
    public category: ExerciseCategory,
    public videoPath: string | null,
    public readonly trainerId: number,
  ) {}

  hasVideo(): boolean {
    return this.videoPath !== null;
  }
}
