import Link from "next/link";
import Logo from "../components/Logo";
import LoginButton from "../components/LoginButton";
import ThemeToggle from "../components/ThemeToggle";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LoginButton label="Već imaš nalog? Prijavi se" />
        </div>
      </header>

      {/* Form */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-bold">Kreiraj nalog</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Registruj se i pronađi savršenog trenera za sebe.
          </p>

          {/* Tip naloga */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-lg border border-indigo-500 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            >
              Tražim trenera
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Ja sam trener
            </button>
          </div>

          <form className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Ime i prezime
              </label>
              <input
                id="name"
                type="text"
                placeholder="Petar Petrović"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email adresa
              </label>
              <input
                id="email"
                type="email"
                placeholder="ime@primer.com"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Lozinka
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-indigo-600"
              />
              <span>
                Prihvatam{" "}
                <Link href="#" className="text-indigo-600 hover:underline">
                  uslove korišćenja
                </Link>{" "}
                i{" "}
                <Link href="#" className="text-indigo-600 hover:underline">
                  politiku privatnosti
                </Link>
                .
              </span>
            </label>

            <button
              type="button"
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Kreiraj nalog
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Već imaš nalog?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:underline"
            >
              Prijavi se
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
