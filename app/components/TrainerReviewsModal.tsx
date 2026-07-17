"use client";

import { useState } from "react";

export type TrainerReviewView = {
  clientName: string;
  rating: number;
  comment: string | null;
  date: string;
};

/**
 * Hipertekst + popup (modal) sa svim ocenama i komentarima jednog trenera.
 * Dostupno svima koji vide trenere (klijent, admin, neregistrovani).
 */
export default function TrainerReviewsModal({
  trainerName,
  reviews,
}: {
  trainerName: string;
  reviews: TrainerReviewView[];
}) {
  const [open, setOpen] = useState(false);
  const count = reviews.length;

  if (count === 0) {
    return (
      <span className="text-sm text-zinc-400">Još nema ocena</span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
      >
        Ocene i komentari ({count})
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold">
                Ocene za {trainerName}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zatvori"
                className="shrink-0 rounded-lg px-2 text-2xl leading-none text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                ×
              </button>
            </div>

            <ul className="mt-4 flex flex-col gap-3 overflow-y-auto">
              {reviews.map((review, index) => (
                <li
                  key={index}
                  className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 font-semibold">
                      {review.clientName}
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-amber-500">
                      ★ {review.rating}/10
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">{review.date}</p>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-zinc-400">
                      Bez komentara
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
