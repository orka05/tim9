"use client";

import { useActionState, useState } from "react";
import { rateClientAction, type RateClientState } from "../lib/clientReviewActions";

const initialState: RateClientState = {};

/** Forma kojom trener ocenjuje klijenta (ocena 1–10 + opcioni komentar). */
export default function ClientRatingForm({
  clientId,
  initialRating,
  initialComment,
}: {
  clientId: number;
  initialRating: number | null;
  initialComment: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    rateClientAction,
    initialState,
  );
  const [rating, setRating] = useState(initialRating ?? 0);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="clientId" value={clientId} />
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
        placeholder="Kratak komentar o saradnji sa klijentom (opciono)..."
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
  );
}
