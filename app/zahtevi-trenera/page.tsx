import { redirect } from "next/navigation";
import Logo from "../components/Logo";
import AuthNav from "../components/AuthNav";
import ThemeToggle from "../components/ThemeToggle";
import { prisma } from "../lib/prisma";
import { requireSession } from "../lib/session";
import { approveTrainerAction, deleteTrainerAction } from "../lib/actions";

export default async function ZahteviTreneraPage() {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/");
  }

  const trainers = await prisma.trainer.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <AuthNav />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Zahtevi za registraciju trenera
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Treneri koji čekaju odobrenje naloga. Nalog postaje aktivan tek nakon
          odobrenja.
        </p>

        {trainers.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
            Nema zahteva na čekanju.
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {trainers.map((trainer) => (
              <li
                key={trainer.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5"
              >
                <div>
                  <h2 className="text-lg font-bold">{trainer.name}</h2>
                  <p className="text-sm text-zinc-500">{trainer.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={approveTrainerAction}>
                    <input type="hidden" name="trainerId" value={trainer.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Odobri
                    </button>
                  </form>
                  <form action={deleteTrainerAction}>
                    <input type="hidden" name="trainerId" value={trainer.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      Odbij
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} Sva prava zadržana Tim9.
      </footer>
    </div>
  );
}
