import Logo from "@/app/components/Logo";
import AuthNav from "@/app/components/AuthNav";
import ThemeToggle from "@/app/components/ThemeToggle";
import TrainerReviewsModal from "@/app/components/TrainerReviewsModal";
import Link from "next/link";
import { TrainersSearchViewModel } from "@/app/viewmodels/TrainersSearchViewModel";

const cities = ["Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica"];

export default async function TrainersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; page?: string }>;
}) {
  const { q = "", city = "", page = "1" } = await searchParams;

  const { trainers, total, totalPages, currentPage } =
    await new TrainersSearchViewModel().search(q, city, Number(page) || 1);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    params.set("page", String(p));
    return `/trainers?${params.toString()}`;
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <AuthNav />
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Pronađi trenera
        </h1>
        <p className="mt-3 max-w-xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Pretraži među verifikovanim trenerima u tvom gradu.
        </p>

        {/* Search bar */}
        <form
          action="/trainers"
          method="get"
          className="mt-10 flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4 md:flex-row md:items-center"
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-300 px-4 dark:border-zinc-700">
            <span className="text-xl text-zinc-400">🔍</span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Pretraži po imenu ili specijalnosti..."
              className="w-full bg-transparent py-3.5 text-base outline-none sm:py-4"
            />
          </div>
          <select
            name="city"
            defaultValue={city}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-base outline-none dark:border-zinc-700 dark:bg-zinc-900 sm:py-4"
          >
            <option value="">Svi gradovi</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-indigo-700 sm:py-4"
          >
            Pretraži
          </button>
        </form>

        {/* Results */}
        <p className="mt-8 self-start text-sm text-zinc-500">
          Pronađeno {total} {total === 1 ? "trener" : "trenera"}
          {totalPages > 1 && ` — strana ${currentPage} od ${totalPages}`}
        </p>

        {trainers.length === 0 ? (
          <p className="mt-10 text-zinc-500">
            Nema rezultata za zadatu pretragu.
          </p>
        ) : (
          <ul className="mt-4 grid w-full gap-4 sm:grid-cols-2">
            {trainers.map((t) => (
              <li
                key={t.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="min-w-0 text-lg font-semibold">{t.name}</h3>
                  <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-amber-500">
                    ★ {t.rating}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {t.specialty}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 text-zinc-500">📍 {t.city}</span>
                  <span className="shrink-0 font-medium text-indigo-600">
                    {t.pricePerMonth} RSD / mesec
                  </span>
                </div>
                <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <TrainerReviewsModal trainerName={t.name} reviews={t.reviews} />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={pageHref(currentPage - 1)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                ← Prethodna
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={pageHref(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={
                  p === currentPage
                    ? "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                }
              >
                {p}
              </Link>
            ))}

            {currentPage < totalPages && (
              <Link
                href={pageHref(currentPage + 1)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Sledeća →
              </Link>
            )}
          </nav>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} Sva prava zadržana Tim9.
      </footer>
    </div>
  );
}
