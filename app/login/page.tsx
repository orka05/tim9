import Link from "next/link";
import Logo from "../components/Logo";
import RegisterButton from "../components/RegisterButton";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <RegisterButton label="Nemaš nalog? Registruj se" />
        </div>
      </header>

      {/* Form */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-bold">Dobrodošao nazad</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Prijavi se na svoj nalog i nastavi sa treningom.
          </p>

          <form className="mt-8 flex flex-col gap-5">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Lozinka
                </label>
                <Link
                  href="#"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Zaboravljena lozinka?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 accent-indigo-600"
              />
              Zapamti me
            </label>

            <button
              type="button"
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Prijavi se
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Nemaš nalog?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:underline"
            >
              Registruj se
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
