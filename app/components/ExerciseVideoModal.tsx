"use client";

import { useEffect, useId, useState } from "react";

export default function ExerciseVideoModal({
  videoPath,
  exerciseName,
}: {
  videoPath: string;
  exerciseName: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 cursor-pointer text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Pogledaj video vežbe
      </button>

      {open && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl dark:bg-zinc-950 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4 pb-4">
              <h2 id={titleId} className="text-lg font-bold sm:text-xl">
                {exerciseName}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zatvori video"
                className="cursor-pointer rounded-lg px-3 py-1 text-2xl leading-none text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                ×
              </button>
            </div>
            <video
              src={videoPath}
              controls
              autoPlay
              className="max-h-[75vh] w-full rounded-xl bg-black"
            >
              Tvoj pregledač ne podržava video.
            </video>
          </div>
        </div>
      )}
    </>
  );
}
