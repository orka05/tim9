import Link from "next/link";
import Logo from "@/app/components/Logo";
import LoginButton from "@/app/components/LoginButton";
import ThemeToggle from "@/app/components/ThemeToggle";
import RegisterForm from "@/app/components/RegisterForm";

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

          <RegisterForm />

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
