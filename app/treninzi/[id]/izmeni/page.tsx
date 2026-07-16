import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AuthNav from "../../../components/AuthNav";
import Logo from "../../../components/Logo";
import ThemeToggle from "../../../components/ThemeToggle";
import TrainingBuilder from "../../../components/TrainingBuilder";
import { prisma } from "../../../lib/prisma";
import { requireSession } from "../../../lib/session";

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

  const [training, exercises] = await Promise.all([
    prisma.training.findFirst({
      where: { id: trainingId, trainerId: session.userId },
      include: {
        client: { select: { id: true, name: true } },
        blocks: {
          select: {
            exerciseId: true,
            sets: true,
            repetitions: true,
            restSeconds: true,
            notes: true,
          },
          orderBy: { position: "asc" },
        },
      },
    }),
    prisma.exercise.findMany({
      where: { trainerId: session.userId },
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href={`/treninzi?clientId=${training.clientId}`}
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
