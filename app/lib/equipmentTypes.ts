export type EquipmentTypeValue = "SPRAVA" | "REKVIZIT";

export type EquipmentTypeConfig = {
  value: EquipmentTypeValue;
  label: string;
  /** Klase kada je dugme aktivno (izabrano) — samo okvir/tekst u boji */
  active: string;
  /** Klase za badge (oznaku tipa na kartici) */
  badge: string;
};

export const EQUIPMENT_TYPES: EquipmentTypeConfig[] = [
  {
    value: "SPRAVA",
    label: "Sprava za vežbanje",
    active:
      "border-red-500 text-red-600 ring-1 ring-red-500/40 dark:border-red-500 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  },
  {
    value: "REKVIZIT",
    label: "Rekvizit",
    active:
      "border-blue-500 text-blue-600 ring-1 ring-blue-500/40 dark:border-blue-500 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  },
];

export const EQUIPMENT_TYPE_BY_VALUE: Record<string, EquipmentTypeConfig> =
  Object.fromEntries(EQUIPMENT_TYPES.map((t) => [t.value, t]));