"use client";

import { useActionState, useState } from "react";
import EquipmentTypeSelect from "./EquipmentTypeSelect";
import { EQUIPMENT_TYPE_BY_VALUE } from "../lib/equipmentTypes";
import {
  updateBaseEquipmentAction,
  deleteBaseEquipmentAction,
  type EquipmentState,
} from "../lib/equipmentActions";

const initialState: EquipmentState = {};

export type BaseEquipmentDTO = {
  id: number;
  name: string;
  description: string;
  type: string;
};

/** Kartica bazne opreme u admin katalogu (izmena / brisanje). */
export default function BaseEquipmentItem({
  item,
}: {
  item: BaseEquipmentDTO;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateBaseEquipmentAction,
    initialState,
  );

  const type = EQUIPMENT_TYPE_BY_VALUE[item.type];

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
          <EquipmentTypeSelect
            defaultValue={(type?.value ?? "SPRAVA") as "SPRAVA"}
          />

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
        <h3 className="text-lg font-semibold">{item.name}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            type?.badge ??
            "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {type?.label ?? item.type}
        </span>
      </div>
      {item.description && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {item.description}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Izmeni
        </button>
        <form action={deleteBaseEquipmentAction}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Obriši
          </button>
        </form>
      </div>
    </li>
  );
}
