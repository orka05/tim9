import Link from "next/link";
import { redirect } from "next/navigation";
import AuthNav from "@/app/components/AuthNav";
import Logo from "@/app/components/Logo";
import ThemeToggle from "@/app/components/ThemeToggle";
import DeleteTrainingButton from "@/app/components/DeleteTrainingButton";
import { requireSession } from "@/app/lib/session";
import { TrainerTrainingsViewModel } from "@/app/viewmodels/TrainerTrainingsViewModel";

function formatRest(seconds: number) {
  if (seconds === 0) return "bez odmora";
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} ${minutes === 1 ? "minut" : "minuta"}`;
  }
  return `${seconds} sekundi`;
}

export default async function TreninziPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const session = await requireSession();
  if (session.role !== "trainer") redirect("/");

  const { clientId: rawClientId } = await searchParams;
  const clientId = rawClientId ? Number(rawClientId) : null;
  if (
    rawClientId &&
    (!Number.isInteger(clientId) || clientId === null || clientId <= 0)
  ) {
    redirect("/treninzi");
  }

  const viewModel = new TrainerTrainingsViewModel();

  const selectedClient = clientId
    ? await viewModel.getSelectedClient(session.userId, clientId)
    : null;

  if (clientId && !selectedClient) redirect("/treninzi");

  const trainings = await viewModel.getTrainings(
    session.userId,
    clientId ?? undefined,
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <AuthNav />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {selectedClient
                ? `Treninzi za: ${selectedClient.name}`
                : "Kreirani treninzi"}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {selectedClient
                ? "Svi treninzi koje si dodelio ovom klijentu."
                : "Svi treninzi koje si dodelio svojim klijentima."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Zahtevi klijenata
            </Link>
          </div>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          {trainings.length === 0
            ? "Još uvek nemaš kreiranih treninga."
            : `Ukupno treninga: ${trainings.length}`}
        </p>

        {trainings.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <p className="text-zinc-500">
              {selectedClient
                ? `Još nisi kreirao trening za klijenta ${selectedClient.name}.`
                : "Prihvati zahtev klijenta, pa mu sa početne stranice kreiraj prvi trening."}
            </p>
            {selectedClient ? (
              <Link
                href={`/treninzi/novi?clientId=${selectedClient.id}`}
                className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Kreiraj trening
              </Link>
            ) : (
              <Link
                href="/"
                className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Idi na zahteve
              </Link>
            )}
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-5">
            {trainings.map((training) => (
              <li
                key={training.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold">{training.title}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Klijent: <span className="font-semibold">{training.client.name}</span>
                      {" · "}
                      {training.client.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <time
                      dateTime={training.scheduledFor
                        .toISOString()
                        .slice(0, 10)}
                      className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    >
                      {training.scheduledFor.toLocaleDateString("sr-Latn-RS", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </time>
                    <Link
                      href={`/treninzi/${training.id}/izmeni`}
                      className="rounded-lg border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                    >
                      Izmeni trening
                    </Link>
                    <DeleteTrainingButton
                      trainingId={training.id}
                      clientId={training.clientId}
                    />
                  </div>
                </div>

                {training.trainingRating != null && (
                  <div className="border-b border-zinc-200 bg-amber-50/50 px-5 py-3 dark:border-zinc-800 dark:bg-amber-950/10 sm:px-6">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      Ocena klijenta za trening: ★ {training.trainingRating}/10
                    </p>
                    {training.trainingComment && (
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                        „{training.trainingComment}"
                      </p>
                    )}
                  </div>
                )}

                <ol className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {training.blocks.map((block, index) => (
                    <li
                      key={block.id}
                      className="grid gap-3 p-5 sm:grid-cols-[2rem_1fr_auto] sm:items-center sm:px-6"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-500 dark:bg-zinc-900">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold">{block.exercise.name}</h3>
                        {block.notes && (
                          <p className="mt-1 text-sm text-zinc-500">
                            {block.notes}
                          </p>
                        )}
                        {block.clientRating != null ? (
                          <p className="mt-1 text-sm font-medium text-amber-500">
                            Ocena klijenta:{" "}
                            {"★".repeat(block.clientRating)}
                            {"☆".repeat(5 - block.clientRating)}{" "}
                            <span className="text-zinc-400">
                              ({block.clientRating}/5)
                            </span>
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-zinc-400">
                            Klijent još nije ocenio ovu vežbu
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 sm:text-right">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {block.sets} × {block.repetitions}
                        </span>
                        <br />
                        Odmor: {formatRest(block.restSeconds)}
                      </p>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
