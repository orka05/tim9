import Link from "next/link";
import AuthNav from "@/app/components/AuthNav";
import Logo from "@/app/components/Logo";
import ThemeToggle from "@/app/components/ThemeToggle";
import TrainerRequestModal from "@/app/components/TrainerRequestModal";
import TrainerReviewsModal from "@/app/components/TrainerReviewsModal";
import { respondTrainerRequestAction, deleteTrainerAction } from "@/app/lib/actions";
import { getSession } from "@/app/lib/session";
import { AdminDashboardViewModel } from "@/app/viewmodels/AdminDashboardViewModel";
import { ClientHomeViewModel } from "@/app/viewmodels/ClientHomeViewModel";
import { TrainerRequestsViewModel } from "@/app/viewmodels/TrainerRequestsViewModel";

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-10">
      <Logo />
      <nav className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <AuthNav />
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
      © {new Date().getFullYear()} Sva prava zadržana Tim9.
    </footer>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

function PublicHome() {
  return (
    <PageShell>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-6 inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          Pronađi savršenog trenera za sebe
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Tvoj put do boljeg <span className="text-indigo-600">treninga</span>{" "}
          počinje ovde
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Poveži se sa ličnim trenerima, pošalji zahtev i dogovori trening na
          jednom mestu.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-indigo-700"
          >
            Započni besplatno
          </Link>
          <Link
            href="/trainers"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-base font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Pogledaj trenere
          </Link>
        </div>
      </main>
    </PageShell>
  );
}

async function ClientHome({ clientId }: { clientId: number }) {
  const trainers = await new ClientHomeViewModel().getTrainers(clientId);

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Izaberi svog trenera
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Pregledaj trenere i pošalji zahtev sa porukom.
          </p>
        </div>

        {trainers.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
            Trenutno nema registrovanih trenera.
          </div>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((trainer) => (
              <li
                key={trainer.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold">{trainer.name}</h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {trainer.specialty || "Trener"}
                    </p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-amber-500">
                    ★ {trainer.rating}
                  </span>
                </div>
                <div className="mt-5 space-y-2 text-sm">
                  <p className="text-zinc-500">
                    📍 {trainer.city || "Grad nije naveden"}
                  </p>
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {trainer.pricePerMonth > 0
                      ? `${trainer.pricePerMonth} RSD mesečno`
                      : "Cena po dogovoru"}
                  </p>
                </div>
                <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <TrainerReviewsModal
                    trainerName={trainer.name}
                    reviews={trainer.reviews}
                  />
                </div>
                <div className="mt-auto flex flex-col">
                  <TrainerRequestModal
                    trainerId={trainer.id}
                    trainerName={trainer.name}
                    requestStatus={trainer.requestStatus}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </PageShell>
  );
}

async function TrainerHome({ trainerId }: { trainerId: number }) {
  const requests = await new TrainerRequestsViewModel().getForTrainer(trainerId);

  const statusLabel = {
    PENDING: "Na čekanju",
    ACCEPTED: "Prihvaćen",
    REJECTED: "Odbijen",
  } as const;

  const statusClass = {
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    ACCEPTED: "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  } as const;

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Zahtevi klijenata
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Pregledaj poruke i prihvati ili odbij zahtev za trening.
        </p>

        {requests.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
            Još uvek nema pristiglih zahteva.
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-4">
            {requests.map((request) => (
              <li
                key={request.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold">{request.clientName}</h2>
                    <p className="text-sm text-zinc-500">{request.clientEmail}</p>
                    <p className="mt-1 text-sm font-semibold text-amber-500">
                      {request.clientRating > 0
                        ? `★ ${request.clientRating.toFixed(1)} — ocena klijenta`
                        : "Klijent još nema ocenu"}
                    </p>
                    {request.status !== "REJECTED" && (
                      <a
                        href={`/oprema-klijenta/${request.clientId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Vidi podatke i opremu klijenta ↗
                      </a>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass[request.status]}`}
                  >
                    {statusLabel[request.status]}
                  </span>
                </div>
                <p className="mt-5 whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {request.message}
                </p>
                <p className="mt-3 text-xs text-zinc-400">
                  Poslato: {request.createdAt.toLocaleString("sr-Latn-RS")}
                </p>

                {request.status === "PENDING" && (
                  <form
                    action={respondTrainerRequestAction}
                    className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end"
                  >
                    <input type="hidden" name="requestId" value={request.id} />
                    <button
                      type="submit"
                      name="decision"
                      value="REJECTED"
                      className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                    >
                      Odbij zahtev
                    </button>
                    <button
                      type="submit"
                      name="decision"
                      value="ACCEPTED"
                      className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Prihvati zahtev
                    </button>
                  </form>
                )}
                {request.status === "ACCEPTED" && (
                  <div className="mt-5 flex flex-col justify-end gap-3 sm:flex-row">
                    <Link
                      href={`/treninzi?clientId=${request.clientId}`}
                      className="rounded-lg border border-indigo-300 px-5 py-2.5 text-center text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                    >
                      Prikaži treninge
                    </Link>
                    <Link
                      href={`/treninzi/novi?clientId=${request.clientId}`}
                      className="rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Kreiraj trening
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </PageShell>
  );
}

async function AdminHome() {
  const viewModel = new AdminDashboardViewModel();
  const trainers = await viewModel.getActiveTrainers();

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Administracija trenera
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Aktivni treneri sortirani po prosečnoj oceni. Baniranjem se nalog
          deaktivira (ne briše trajno).
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/zahtevi-trenera"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Zahtevi za registraciju
          </Link>
          <Link
            href="/banovani-treneri"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Banovani treneri
          </Link>
        </div>

        {trainers.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
            Nema registrovanih trenera.
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {trainers.map((trainer) => (
              <li
                key={trainer.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="w-6 shrink-0 text-center text-sm font-bold text-zinc-400">
                    {trainer.rank}.
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold">{trainer.name}</h2>
                    <p className="text-sm text-zinc-500">
                      {trainer.specialty}
                      {trainer.location}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-amber-500">
                    ★ {trainer.rating}
                  </span>
                  <form action={deleteTrainerAction}>
                    <input type="hidden" name="trainerId" value={trainer.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      Ban
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </PageShell>
  );
}

export default async function Home() {
  const session = await getSession();
  if (!session) return <PublicHome />;
  if (session.role === "client") return <ClientHome clientId={session.userId} />;
  if (session.role === "admin") return <AdminHome />;
  return <TrainerHome trainerId={session.userId} />;
}
