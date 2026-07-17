"use client";

import { useActionState, useRef } from "react";
import EquipmentTypeSelect from "./EquipmentTypeSelect";
import {
  createEquipmentAction,
  type EquipmentState,
} from "../lib/equipmentActions";

const initialState: EquipmentState = {};

export default function EquipmentForm() {
  const [state, formAction, pending] = useActionState(
    createEquipmentAction,
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
      <h2 className="text-lg font-semibold">Dodaj opremu</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="eq-name" className="text-sm font-medium">
          Naziv
        </label>
        <input
          id="eq-name"
          name="name"
          required
          maxLength={100}
          placeholder="npr. Bučice 10kg"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="eq-description" className="text-sm font-medium">
          Opis (opciono)
        </label>
        <textarea
          id="eq-description"
          name="description"
          maxLength={500}
          rows={3}
          placeholder="Kratak opis opreme..."
          className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <EquipmentTypeSelect />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400">
          Oprema je uspešno dodata.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Dodavanje..." : "Dodaj opremu"}
      </button>
    </form>
  );
}