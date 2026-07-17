import Link from "next/link";
import { redirect } from "next/navigation";
import AuthNav from "@/app/components/AuthNav";
import Logo from "@/app/components/Logo";
import ThemeToggle from "@/app/components/ThemeToggle";
import TrainingBuilder from "@/app/components/TrainingBuilder";
import { requireSession } from "@/app/lib/session";
import { NewTrainingViewModel } from "@/app/viewmodels/NewTrainingViewModel";

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

  const data = await new NewTrainingViewModel().load(session.userId, clientId);

  if (!data) redirect("/");

  const { client, exercises } = data;

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
            client={client}
            exercises={exercises}
          />
        </div>
      </main>
    </div>
  );
}
