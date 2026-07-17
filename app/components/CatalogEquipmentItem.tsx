import { EQUIPMENT_TYPE_BY_VALUE } from "../lib/equipmentTypes";
import { addOwnedEquipmentAction } from "../lib/equipmentActions";

export type CatalogItemDTO = {
  id: number;
  name: string;
  description: string;
  type: string;
};

/** Bazna oprema iz kataloga koju klijent može da doda u svoju listu. */
export default function CatalogEquipmentItem({
  item,
}: {
  item: CatalogItemDTO;
}) {
  const type = EQUIPMENT_TYPE_BY_VALUE[item.type];

  return (
    <li className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-lg font-semibold">{item.name}</h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
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

      <div className="mt-4 flex justify-end">
        <form action={addOwnedEquipmentAction}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Dodaj u moju opremu
          </button>
        </form>
      </div>
    </li>
  );
}
