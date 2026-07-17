"use client";

import { useActionState, useState } from "react";
import CategorySelect from "./CategorySelect";
import { CATEGORY_BY_VALUE } from "../lib/exerciseCategories";
import {
  updateExerciseAction,
  deleteExerciseAction,
  type ExerciseState,
} from "../lib/exerciseActions";

const initialState: ExerciseState = {};

export type ExerciseDTO = {
  id: number;
  name: string;
  description: string;
  category: string;
  videoPath: string | null;
};

export default function ExerciseItem({ item }: { item: ExerciseDTO }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateExerciseAction,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteExerciseAction,
    initialState,
  );

  const cat = CATEGORY_BY_VALUE[item.category];

  if (editing) {
    return (
      <li className="rounded-2xl border border-indigo-200 bg-white p-5 text-left shadow-sm dark:border-indigo-900 dark:bg-zinc-950">
        <form
          action={async (formData) => {
            await formAction(formData);
            setEditing(false);
          }}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="id" value={item.id} />
          <input
            name="name"
            defaultValue={item.name}
            required
            maxLength={100}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <textarea
            name="description"
            defaultValue={item.description}
            maxLength={500}
            rows={3}
            className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <CategorySelect
            defaultValue={(cat?.value ?? "SPRAVA") as "SPRAVA"}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              {item.videoPath ? "Zameni video (opciono)" : "Dodaj video (opciono)"}
            </label>
            <input
              name="video"
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-600 outline-none file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            />
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {pending ? "Čuvanje..." : "Sačuvaj"}
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-lg font-semibold">{item.name}</h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            cat?.badge ??
            "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {cat?.label ?? item.category}
        </span>
      </div>
      {item.description && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {item.description}
        </p>
      )}

      {item.videoPath && (
        <video
          controls
          preload="metadata"
          src={item.videoPath}
          className="mt-3 w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
        />
      )}

      <div className="mt-4 flex flex-col gap-2">
        {deleteState.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {deleteState.error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Izmeni
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              disabled={deletePending}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {deletePending ? "Brisanje..." : "Obriši"}
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
