import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AuthNav from "@/app/components/AuthNav";
import Logo from "@/app/components/Logo";
import ThemeToggle from "@/app/components/ThemeToggle";
import ExerciseVideoModal from "@/app/components/ExerciseVideoModal";
import ExerciseRating from "@/app/components/ExcerciseRating";
import TrainingRatings from "@/app/components/TrainingRatings";
import { requireSession } from "@/app/lib/session";
import { MyTrainingDetailViewModel } from "@/app/viewmodels/MyTrainingDetailViewModel";

function formatRest(seconds: number) {
  if (seconds === 0) return "bez odmora";
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} ${minutes === 1 ? "minut" : "minuta"}`;
  }
  return `${seconds} sekundi`;
}

export default async function TreningDetaljiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (session.role !== "client") redirect("/");

  const { id: rawId } = await params;
  const trainingId = Number(rawId);
  if (!Number.isInteger(trainingId) || trainingId <= 0) notFound();

  const training = await new MyTrainingDetailViewModel().getForClient(
    trainingId,
    session.userId,
  );

  if (!training) notFound();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <AuthNav />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/moji-treneri"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Nazad na moje trenere
        </Link>

        <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {training.title}
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Trener: <span className="font-semibold">{training.trainer.name}</span>
                {training.trainer.specialty && ` · ${training.trainer.specialty}`}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {training.trainer.email}
              </p>
            </div>
            <time
              dateTime={training.scheduledFor.toISOString().slice(0, 10)}
              className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
            >
              {training.scheduledFor.toLocaleDateString("sr-Latn-RS", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </time>
          </div>
          <TrainingRatings
            trainingId={training.id}
            initialTrainingRating={training.trainingRating}
            initialTrainerRating={training.trainerRating}
          />
        </section>

        <h2 className="mt-8 text-2xl font-bold">Vežbe</h2>
        <ol className="mt-4 flex flex-col gap-4">
          {training.blocks.map((block, index) => (
            <li
              key={block.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-[2.5rem_1fr_auto] sm:items-start">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{block.exercise.name}</h3>
                  {block.exercise.description && (
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {block.exercise.description}
                    </p>
                  )}
                  {block.notes && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                      Napomena trenera: {block.notes}
                    </p>
                  )}
                  {block.exercise.videoPath && (
                    <ExerciseVideoModal
                      videoPath={block.exercise.videoPath}
                      exerciseName={block.exercise.name}
                    />
                  )}
                  <ExerciseRating
                    blockId={block.id}
                    initialRating={block.clientRating}
                  />
                </div>
                <p className="rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 sm:text-right">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {block.sets} × {block.repetitions}
                  </span>
                  <br />
                  Odmor: {formatRest(block.restSeconds)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
