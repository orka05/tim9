"use client";

import { useActionState, useState } from "react";
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
  initialTrainingComment,
  initialTrainerRating,
  initialTrainerComment,
}: {
  trainingId: number;
  initialTrainingRating: number | null;
  initialTrainingComment: string | null;
  initialTrainerRating: number | null;
  initialTrainerComment: string | null;
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
    <div className="mt-5 grid gap-6 sm:grid-cols-2">
      <RatingForm
        label="Oceni ovaj trening"
        commentPlaceholder="Kratak komentar o treningu (opciono)..."
        trainingId={trainingId}
        initialRating={initialTrainingRating}
        initialComment={initialTrainingComment}
        state={trainingState}
        formAction={trainingFormAction}
        pending={trainingPending}
      />
      <RatingForm
        label="Oceni trenera"
        commentPlaceholder="Kratak komentar o treneru (opciono)..."
        trainingId={trainingId}
        initialRating={initialTrainerRating}
        initialComment={initialTrainerComment}
        state={trainerState}
        formAction={trainerFormAction}
        pending={trainerPending}
      />
    </div>
  );
}

function RatingForm({
  label,
  commentPlaceholder,
  trainingId,
  initialRating,
  initialComment,
  state,
  formAction,
  pending,
}: {
  label: string;
  commentPlaceholder: string;
  trainingId: number;
  initialRating: number | null;
  initialComment: string | null;
  state: RateTrainingState | RateTrainerState;
  formAction: (formData: FormData) => void;
  pending: boolean;
}) {
  const [rating, setRating] = useState(initialRating ?? 0);

  return (
    <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <form action={formAction} className="mt-2 flex flex-col gap-2">
        <input type="hidden" name="trainingId" value={trainingId} />
        <input type="hidden" name="rating" value={rating} />

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`Oceni sa ${star} od 10`}
              className={`text-2xl leading-none transition ${
                star <= rating
                  ? "text-amber-400"
                  : "text-zinc-300 hover:text-amber-300 dark:text-zinc-700"
              }`}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-xs text-zinc-500">{rating}/10</span>
          )}
        </div>

        <textarea
          name="comment"
          defaultValue={initialComment ?? ""}
          maxLength={500}
          rows={2}
          placeholder={commentPlaceholder}
          className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending || rating < 1}
            className="self-start rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Čuvanje..." : "Sačuvaj ocenu"}
          </button>
          {state.error && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {state.error}
            </span>
          )}
          {state.success && (
            <span className="text-xs text-green-600 dark:text-green-400">
              Ocena sačuvana.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
