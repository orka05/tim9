import Link from "next/link";
import { redirect } from "next/navigation";
import AuthNav from "../../components/AuthNav";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import TrainingBuilder from "../../components/TrainingBuilder";
import { prisma } from "../../lib/prisma";
import { requireSession } from "../../lib/session";

export default async function NoviTreningPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const session = await requireSession();
  if (session.role !== "trainer") redirect("/");

  const { clientId: rawClientId } = await searchParams;
  const clientId = Number(rawClientId);
  if (!Number.isInteger(clientId) || clientId <= 0) redirect("/");

  const [acceptedRequest, exercises] = await Promise.all([
    prisma.trainerRequest.findFirst({
      where: { trainerId: session.userId, clientId, status: "ACCEPTED" },
      include: { client: { select: { id: true, name: true } } },
    }),
    prisma.exercise.findMany({
      where: { trainerId: session.userId },
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!acceptedRequest) redirect("/");

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
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
          ← Nazad na zahteve
        </Link>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          Kreiraj trening
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Odredi dan i složi blokove vežbi željenim redosledom.
        </p>

        <div className="mt-8">
          <TrainingBuilder
            client={acceptedRequest.client}
            exercises={exercises}
          />
        </div>
      </main>
    </div>
  );
}
