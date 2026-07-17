import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AuthNav from "@/app/components/AuthNav";
import Logo from "@/app/components/Logo";
import ThemeToggle from "@/app/components/ThemeToggle";
import TrainingBuilder from "@/app/components/TrainingBuilder";
import DeleteTrainingButton from "@/app/components/DeleteTrainingButton";
import { requireSession } from "@/app/lib/session";
import { TrainingEditViewModel } from "@/app/viewmodels/TrainingEditViewModel";

export default async function IzmeniTreningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (session.role !== "trainer") redirect("/");

  const { id: rawId } = await params;
  const trainingId = Number(rawId);
  if (!Number.isInteger(trainingId) || trainingId <= 0) notFound();

  const data = await new TrainingEditViewModel().load(
    trainingId,
    session.userId,
  );

  if (!data) notFound();

  const { training, exercises } = data;

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
        <Link
          href={`/treninzi?clientId=${training.client.id}`}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Nazad na treninge klijenta
        </Link>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          Izmeni trening
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Promeni datum, podatke blokova ili njihov redosled.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Obriši trening
            </p>
            <p className="text-sm text-red-600/80 dark:text-red-400/70">
              Ako je trening napravljen greškom, možeš ga trajno ukloniti.
            </p>
          </div>
          <DeleteTrainingButton
            trainingId={training.id}
            clientId={training.client.id}
          />
        </div>

        <div className="mt-8">
          <TrainingBuilder
            client={training.client}
            exercises={exercises}
            initialTraining={{
              id: training.id,
              title: training.title,
              scheduledFor: training.scheduledFor.toISOString().slice(0, 10),
              blocks: training.blocks,
            }}
          />
        </div>
      </main>
    </div>
  );
}
