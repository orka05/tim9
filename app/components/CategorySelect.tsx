"use client";

import { useState } from "react";
import {
  EXERCISE_CATEGORIES,
  type ExerciseCategoryValue,
} from "../lib/exerciseCategories";

const inactiveClass =
  "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900";

export default function CategorySelect({
  name = "category",
  defaultValue = "SPRAVA",
}: {
  name?: string;
  defaultValue?: ExerciseCategoryValue;
}) {
  const [selected, setSelected] = useState<ExerciseCategoryValue>(defaultValue);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Kategorija</span>
      <input type="hidden" name={name} value={selected} />
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {EXERCISE_CATEGORIES.map((cat) => {
          const isActive = selected === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelected(cat.value)}
              className={`flex items-center justify-center rounded-2xl border-2 px-3 py-5 text-sm font-semibold transition ${
                isActive ? cat.active : inactiveClass
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
