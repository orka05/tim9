import Link from "next/link";
import Logo from "./components/Logo";
import AuthNav from "./components/AuthNav";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Logo />

        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <AuthNav />
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-6 inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          Pronađi savršenog trenera za sebe
        </span>

        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Tvoj put do boljeg{" "}
          <span className="text-indigo-600">treninga</span> počinje ovde
        </h1>

        <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Poveži se sa verifikovanim ličnim trenerima u tvom gradu. Pretraži,
          uporedi i rezerviši termin — sve na jednom mestu.
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
            className="rounded-lg border border-zinc-300 px-6 py-3 text-base font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Pogledaj trenere
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-3">
          {[
            {
              title: "Verifikovani treneri",
              text: "Svi treneri prolaze proveru sertifikata i iskustva.",
            },
            {
              title: "Lako zakazivanje",
              text: "Rezerviši termin u par klikova, bilo kada.",
            },
            {
              title: "Ocene i recenzije",
              text: "Odaberi na osnovu iskustava drugih korisnika.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} Sva prava zadržana Tim9.
      </footer>
    </div>
  );
}
