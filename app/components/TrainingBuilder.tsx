"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  createTrainingAction,
  type TrainingState,
  updateTrainingAction,
} from "../lib/trainingActions";

type ExerciseOption = {
  id: number;
  name: string;
  category: string;
};

type EditableBlock = {
  key: number;
  exerciseId: number;
  sets: number;
  repetitions: number;
  restSeconds: number;
  notes: string;
};

type InitialTraining = {
  id: number;
  title: string;
  scheduledFor: string;
  blocks: Array<Omit<EditableBlock, "key">>;
};

const initialState: TrainingState = {};
const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900";

export default function TrainingBuilder({
  client,
  exercises,
  initialTraining,
}: {
  client: { id: number; name: string };
  exercises: ExerciseOption[];
  initialTraining?: InitialTraining;
}) {
  const nextKey = useRef(Math.max(initialTraining?.blocks.length ?? 1, 1));
  const [blocks, setBlocks] = useState<EditableBlock[]>(() =>
    initialTraining
      ? initialTraining.blocks.map((block, index) => ({
          ...block,
          key: index + 1,
        }))
      : exercises.length
      ? [
          {
            key: 1,
            exerciseId: exercises[0].id,
            sets: 3,
            repetitions: 10,
            restSeconds: 60,
            notes: "",
          },
        ]
      : [],
  );
  const [draggedKey, setDraggedKey] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(
    initialTraining ? updateTrainingAction : createTrainingAction,
    initialState,
  );

  const updateBlock = (key: number, data: Partial<EditableBlock>) => {
    setBlocks((current) =>
      current.map((block) => (block.key === key ? { ...block, ...data } : block)),
    );
  };

  const addBlock = () => {
    if (!exercises.length || blocks.length >= 50) return;
    nextKey.current += 1;
    setBlocks((current) => [
      ...current,
      {
        key: nextKey.current,
        exerciseId: exercises[0].id,
        sets: 3,
        repetitions: 10,
        restSeconds: 60,
        notes: "",
      },
    ]);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blocks.length || fromIndex === toIndex) return;
    setBlocks((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const dropOn = (targetKey: number) => {
    if (draggedKey === null || draggedKey === targetKey) return;
    const fromIndex = blocks.findIndex((block) => block.key === draggedKey);
    const toIndex = blocks.findIndex((block) => block.key === targetKey);
    moveBlock(fromIndex, toIndex);
    setDraggedKey(null);
  };

  if (!exercises.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="font-semibold">Prvo dodaj bar jednu vežbu.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Blok treninga mora da koristi vežbu iz tvog skupa.
        </p>
        <Link
          href="/vezbe"
          className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Idi na vežbe
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-900 dark:bg-green-950/30">
        <h2 className="text-xl font-bold text-green-800 dark:text-green-300">
          Trening je uspešno {initialTraining ? "izmenjen" : "kreiran"}
        </h2>
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          Plan treninga za klijenta {client.name} sačuvan je sa svim blokovima.
        </p>
        <Link
          href={`/treninzi?clientId=${client.id}`}
          className="mt-5 inline-block rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Pogledaj treninge klijenta
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-7">
      <input type="hidden" name="clientId" value={client.id} />
      {initialTraining && (
        <input type="hidden" name="trainingId" value={initialTraining.id} />
      )}
      <input
        type="hidden"
        name="blocks"
        value={JSON.stringify(
          blocks.map(({ exerciseId, sets, repetitions, restSeconds, notes }) => ({
            exerciseId,
            sets,
            repetitions,
            restSeconds,
            notes,
          })),
        )}
      />

      <section className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2 sm:p-6">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-zinc-500">Klijent</span>
          <span className="text-lg font-bold">{client.name}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium">
            Naziv treninga
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={120}
            defaultValue={initialTraining?.title}
            placeholder="npr. Trening nogu"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scheduledFor" className="text-sm font-medium">
            Datum treninga
          </label>
          <input
            id="scheduledFor"
            name="scheduledFor"
            type="date"
            required
            defaultValue={initialTraining?.scheduledFor}
            className={inputClass}
          />
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Blokovi treninga</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Uhvati ručicu ⋮⋮ i prevuci blok ili koristi strelice.
            </p>
          </div>
          <button
            type="button"
            onClick={addBlock}
            disabled={blocks.length >= 50}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            + Dodaj blok
          </button>
        </div>

        <ol className="mt-5 flex flex-col gap-4">
          {blocks.map((block, index) => (
            <li
              key={block.key}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(block.key)}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-zinc-950 sm:p-5 ${
                draggedKey === block.key
                  ? "border-indigo-500 opacity-60"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDraggedKey(block.key)}
                    onDragEnd={() => setDraggedKey(null)}
                    aria-label={`Prevuci blok ${index + 1}`}
                    title="Prevuci za promenu redosleda"
                    className="cursor-grab rounded-lg border border-zinc-300 px-3 py-2 text-lg text-zinc-500 active:cursor-grabbing dark:border-zinc-700"
                  >
                    ⋮⋮
                  </button>
                  <h3 className="font-bold">
                    {exercises.find(
                      (exercise) => exercise.id === block.exerciseId,
                    )?.name ?? `Vežba ${index + 1}`}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveBlock(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Pomeri blok gore"
                    className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, index + 1)}
                    disabled={index === blocks.length - 1}
                    aria-label="Pomeri blok dole"
                    className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBlocks((current) =>
                        current.filter((item) => item.key !== block.key),
                      )
                    }
                    disabled={blocks.length === 1}
                    aria-label="Obriši blok"
                    className="cursor-pointer rounded-lg border border-red-200 px-3 py-1.5 text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:border-red-900"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                  <label className="text-sm font-medium">Vežba</label>
                  <select
                    value={block.exerciseId}
                    onChange={(event) =>
                      updateBlock(block.key, { exerciseId: Number(event.target.value) })
                    }
                    className={inputClass}
                  >
                    {exercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </div>
                <NumberField
                  label="Broj serija"
                  value={block.sets}
                  min={1}
                  max={100}
                  onChange={(sets) => updateBlock(block.key, { sets })}
                />
                <NumberField
                  label="Ponavljanja"
                  value={block.repetitions}
                  min={1}
                  max={1000}
                  onChange={(repetitions) =>
                    updateBlock(block.key, { repetitions })
                  }
                />
                <NumberField
                  label="Odmor (sekunde)"
                  value={block.restSeconds}
                  min={0}
                  max={3600}
                  onChange={(restSeconds) =>
                    updateBlock(block.key, { restSeconds })
                  }
                />
                <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
                  <label className="text-sm font-medium">Napomena (opciono)</label>
                  <textarea
                    value={block.notes}
                    onChange={(event) =>
                      updateBlock(block.key, { notes: event.target.value })
                    }
                    maxLength={500}
                    rows={2}
                    placeholder="Tempo, težina ili dodatno objašnjenje..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || blocks.length === 0}
        className="self-end rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {pending
          ? "Čuvanje..."
          : initialTraining
            ? "Sačuvaj izmene"
            : "Sačuvaj trening"}
      </button>
    </form>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="number"
        required
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={inputClass}
      />
    </div>
  );
}
