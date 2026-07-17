"use client";

import { useActionState } from "react";
import {
  rateTrainerAction,
  rateTrainingAction,
  type RateTrainerState,
  type RateTrainingState,
} from "../lib/trainingActions";

const initialTrainingState: RateTrainingState = {};
const initialTrainerState: RateTrainerState = {};

export default function TrainingRatings({
  trainingId,
  initialTrainingRating,
  initialTrainerRating,
}: {
  trainingId: number;
  initialTrainingRating: number | null;
  initialTrainerRating: number | null;
}) {
  const [trainingState, trainingFormAction, trainingPending] = useActionState(
    rateTrainingAction,
    initialTrainingState,
  );
  const [trainerState, trainerFormAction, trainerPending] = useActionState(
    rateTrainerAction,
    initialTrainerState,
  );

  return (
    <div className="mt-5 grid gap-1 sm:grid-cols-2 sm:gap-6">
      <RatingForm
        label="Oceni ovaj trening"
        trainingId={trainingId}
        initialRating={initialTrainingRating}
        state={trainingState}
        formAction={trainingFormAction}
        pending={trainingPending}
      />
      <RatingForm
        label="Oceni trenera"
        trainingId={trainingId}
        initialRating={initialTrainerRating}
        state={trainerState}
        formAction={trainerFormAction}
        pending={trainerPending}
      />
    </div>
  );
}

function RatingForm({
  label,
  trainingId,
  initialRating,
  state,
  formAction,
  pending,
}: {
  label: string;
  trainingId: number;
  initialRating: number | null;
  state: RateTrainingState | RateTrainerState;
  formAction: (formData: FormData) => void;
  pending: boolean;
}) {
  const displayedRating = state.rating ?? initialRating ?? 0;

  return (
    <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <form action={formAction} className="mt-2 flex items-center gap-1">
        <input type="hidden" name="trainingId" value={trainingId} />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="submit"
            name="rating"
            value={star}
            disabled={pending}
            aria-label={`Oceni sa ${star} od 10`}
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
            {displayedRating}/10
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
