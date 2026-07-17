import Link from "next/link";
import { redirect } from "next/navigation";
import AuthNav from "@/app/components/AuthNav";
import Logo from "@/app/components/Logo";
import ThemeToggle from "@/app/components/ThemeToggle";
import { requireSession } from "@/app/lib/session";
import { MyTrainersViewModel } from "@/app/viewmodels/MyTrainersViewModel";

export default async function MojiTreneriPage() {
  const session = await requireSession();
  if (session.role !== "client") redirect("/");

  const trainers = await new MyTrainersViewModel().getForClient(session.userId);

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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Moji treneri
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Izaberi trening da vidiš vežbe i uputstva trenera.
        </p>

        {trainers.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
            Još uvek nemaš trenera koji je prihvatio tvoj zahtev.
          </div>
        ) : (
          <ul className="mt-8 grid gap-6 lg:grid-cols-2">
            {trainers.map((trainer) => (
              <li
                key={trainer.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="border-b border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold">{trainer.name}</h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        {trainer.specialty || "Trener"}
                        {trainer.city && ` · ${trainer.city}`}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-amber-500">
                      ★ {trainer.rating}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    Treninzi
                  </h3>
                  {trainer.trainings.length === 0 ? (
                    <p className="mt-4 text-sm text-zinc-500">
                      Ovaj trener ti još nije zadao nijedan trening.
                    </p>
                  ) : (
                    <ul className="mt-3 flex flex-col gap-2">
                      {trainer.trainings.map((training) => (
                        <li key={training.id}>
                          <Link
                            href={`/moji-treninzi/${training.id}`}
                            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 px-4 py-3 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
                          >
                            <span className="min-w-0 font-semibold">{training.title}</span>
                            <time
                              dateTime={training.scheduledFor
                                .toISOString()
                                .slice(0, 10)}
                              className="shrink-0 whitespace-nowrap text-sm text-zinc-500"
                            >
                              {training.scheduledFor.toLocaleDateString(
                                "sr-Latn-RS",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                },
                              )}
                            </time>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
