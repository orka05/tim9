"use client";

import { deleteTrainingAction } from "../lib/trainingActions";

/**
 * Dugme za brisanje treninga (samo trener). Traži potvrdu pre slanja,
 * jer je brisanje nepovratno.
 */
export default function DeleteTrainingButton({
  trainingId,
  clientId,
  className,
  label = "Obriši trening",
}: {
  trainingId: number;
  clientId: number;
  className?: string;
  label?: string;
}) {
  return (
    <form
      action={deleteTrainingAction}
      onSubmit={(e) => {
        if (
          !confirm(
            "Da li sigurno želiš da obrišeš ovaj trening? Ova akcija je nepovratna.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="trainingId" value={trainingId} />
      <input type="hidden" name="clientId" value={clientId} />
      <button
        type="submit"
        className={
          className ??
          "rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
        }
      >
        {label}
      </button>
    </form>
  );
}
