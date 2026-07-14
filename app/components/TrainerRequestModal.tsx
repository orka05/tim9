"use client";

import { useActionState, useState } from "react";
import {
  sendTrainerRequestAction,
  type TrainerRequestState,
} from "../lib/actions";

const initialState: TrainerRequestState = {};

export default function TrainerRequestModal({
  trainerId,
  trainerName,
  requestStatus,
}: {
  trainerId: number;
  trainerName: string;
  requestStatus: "PENDING" | "ACCEPTED" | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    sendTrainerRequestAction,
    initialState,
  );

  if (requestStatus === "ACCEPTED") {
    return (
      <span className="mt-5 rounded-lg bg-green-100 px-4 py-2.5 text-center text-sm font-semibold text-green-800 dark:bg-green-950/60 dark:text-green-300">
        Zahtev prihvaćen
      </span>
    );
  }

  if (requestStatus === "PENDING" || state.success) {
    return (
      <span className="mt-5 rounded-lg bg-amber-100 px-4 py-2.5 text-center text-sm font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
        Zahtev je na čekanju
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Zakaži trening
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`request-title-${trainerId}`}
            className="w-full max-w-lg rounded-2xl bg-white p-6 text-left shadow-2xl dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={`request-title-${trainerId}`}
                  className="text-xl font-bold"
                >
                  Pošalji zahtev
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Trener: {trainerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zatvori"
                className="rounded-lg px-2 py-1 text-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ×
              </button>
            </div>

            <form action={formAction} className="mt-6 flex flex-col gap-4">
              <input type="hidden" name="trainerId" value={trainerId} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`message-${trainerId}`} className="text-sm font-medium">
                  Poruka treneru
                </label>
                <textarea
                  id={`message-${trainerId}`}
                  name="message"
                  required
                  maxLength={1000}
                  rows={5}
                  placeholder="Napiši cilj treninga, dostupne termine ili drugo što trener treba da zna..."
                  className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              {state.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  {state.error}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {pending ? "Slanje..." : "Potvrdi slanje"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
