import { notFound, redirect } from "next/navigation";
import Logo from "@/app/components/Logo";
import AuthNav from "@/app/components/AuthNav";
import ThemeToggle from "@/app/components/ThemeToggle";
import { requireSession } from "@/app/lib/session";
import { EQUIPMENT_TYPE_BY_VALUE } from "@/app/lib/equipmentTypes";
import { TrainerClientEquipmentViewModel } from "@/app/viewmodels/TrainerClientEquipmentViewModel";

export default async function OpremaKlijentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (session.role !== "trainer") redirect("/");

  const { id: rawId } = await params;
  const clientId = Number(rawId);
  if (!Number.isInteger(clientId) || clientId <= 0) notFound();

  const data = await new TrainerClientEquipmentViewModel().load(
    session.userId,
    clientId,
  );
  if (!data) notFound();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <AuthNav />
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Oprema klijenta
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Oprema koju poseduje{" "}
          <span className="font-semibold">{data.clientName}</span>.
        </p>

        <p className="mt-8 text-sm text-zinc-500">
          {data.equipment.length === 0
            ? "Ovaj klijent još nema unetu opremu."
            : `Ukupno opreme: ${data.equipment.length}`}
        </p>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {data.equipment.map((item) => {
            const type = EQUIPMENT_TYPE_BY_VALUE[item.type];
            return (
              <li
                key={item.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        type?.badge ??
                        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {type?.label ?? item.type}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.isCustom
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {item.isCustom ? "Custom" : "Iz kataloga"}
                    </span>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </main>

      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} Sva prava zadržana Tim9.
      </footer>
    </div>
  );
}
