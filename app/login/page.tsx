import Link from "next/link";
import Logo from "../components/Logo";
import RegisterButton from "../components/RegisterButton";
import ThemeToggle from "../components/ThemeToggle";
import LoginForm from "../components/LoginForm";

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

          <LoginForm />

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
