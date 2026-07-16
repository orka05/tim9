export type ExerciseCategoryValue = "SPRAVA" | "REKVIZIT" | "BODYWEIGHT";

export type ExerciseCategoryConfig = {
  value: ExerciseCategoryValue;
  label: string;
  /** Klase kada je dugme aktivno (izabrano) — samo okvir/tekst u boji */
  active: string;
  /** Klase za badge (oznaku kategorije na kartici) */
  badge: string;
};

// Redosled: crvena (Sprava), zelena (Bodyweight), plava (Rekvizit)
export const EXERCISE_CATEGORIES: ExerciseCategoryConfig[] = [
  {
    value: "SPRAVA",
    label: "Sprava",
    active:
      "border-red-500 text-red-600 ring-1 ring-red-500/40 dark:border-red-500 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  },
  {
    value: "BODYWEIGHT",
    label: "Bodyweight",
    active:
      "border-green-500 text-green-600 ring-1 ring-green-500/40 dark:border-green-500 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
  },
  {
    value: "REKVIZIT",
    label: "Rekvizit",
    active:
      "border-blue-500 text-blue-600 ring-1 ring-blue-500/40 dark:border-blue-500 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  },
];

export const CATEGORY_BY_VALUE: Record<string, ExerciseCategoryConfig> =
  Object.fromEntries(EXERCISE_CATEGORIES.map((c) => [c.value, c]));
