"use client";

import { useState } from "react";
import {
  EQUIPMENT_TYPES,
  type EquipmentTypeValue,
} from "../lib/equipmentTypes";

const inactiveClass =
  "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900";

export default function EquipmentTypeSelect({
  name = "type",
  defaultValue = "SPRAVA",
}: {
  name?: string;
  defaultValue?: EquipmentTypeValue;
}) {
  const [selected, setSelected] = useState<EquipmentTypeValue>(defaultValue);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Tip</span>
      <input type="hidden" name={name} value={selected} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {EQUIPMENT_TYPES.map((t) => {
          const isActive = selected === t.value;
          return (
            <button
              key={t.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelected(t.value)}
              className={`flex items-center justify-center rounded-2xl border-2 px-3 py-5 text-sm font-semibold transition ${
                isActive ? t.active : inactiveClass
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}