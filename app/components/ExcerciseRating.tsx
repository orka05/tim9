"use client";

import { useActionState } from "react";
import {
  rateTrainingBlockAction,
  type RateExerciseState,
} from "../lib/trainingActions";

const initialState: RateExerciseState = {};

export default function ExerciseRating({
  blockId,
  initialRating,
}: {
  blockId: number;
  initialRating: number | null;
}) {
  const [state, formAction, pending] = useActionState(
    rateTrainingBlockAction,
    initialState,
  );

  const displayedRating = state.rating ?? initialRating ?? 0;

  return (
    <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Oceni ovu vežbu
      </p>
      <form action={formAction} className="mt-2 flex items-center gap-1">
        <input type="hidden" name="blockId" value={blockId} />
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="submit"
            name="rating"
            value={star}
            disabled={pending}
            aria-label={`Oceni sa ${star} od 5`}
            className={`text-2xl leading-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
              star <= displayedRating
                ? "text-amber-400"
                : "text-zinc-300 hover:text-amber-300 dark:text-zinc-700"
            }`}
          >
            ★
          </button>
        ))}
        {displayedRating > 0 && (
          <span className="ml-2 text-xs text-zinc-500">
            {displayedRating}/5
          </span>
        )}
      </form>

      {state.error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
          Ocena sačuvana.
        </p>
      )}
    </div>
  );
}
