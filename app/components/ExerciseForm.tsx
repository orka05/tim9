"use client";

import { useActionState, useRef } from "react";
import CategorySelect from "./CategorySelect";
import {
  createExerciseAction,
  type ExerciseState,
} from "../lib/exerciseActions";

const initialState: ExerciseState = {};

export default function ExerciseForm() {
  const [state, formAction, pending] = useActionState(
    createExerciseAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2 className="text-lg font-semibold">Dodaj vežbu</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ex-name" className="text-sm font-medium">
          Naziv
        </label>
        <input
          id="ex-name"
          name="name"
          required
          maxLength={100}
          placeholder="npr. Potisak sa grudi"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ex-description" className="text-sm font-medium">
          Opis (opciono)
        </label>
        <textarea
          id="ex-description"
          name="description"
          maxLength={500}
          rows={3}
          placeholder="Kratak opis vežbe i izvođenja..."
          className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <CategorySelect />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ex-video" className="text-sm font-medium">
          Video vežbe (opciono)
        </label>
        <input
          id="ex-video"
          name="video"
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-600 outline-none file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
        />
        <span className="text-xs text-zinc-400">
          MP4, WebM, OGG ili MOV — do 50 MB.
        </span>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400">
          Vežba je uspešno dodata.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Dodavanje..." : "Dodaj vežbu"}
      </button>
    </form>
  );
}
