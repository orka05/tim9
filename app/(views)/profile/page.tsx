import { redirect } from "next/navigation";
import Logo from "@/app/components/Logo";
import ThemeToggle from "@/app/components/ThemeToggle";
import AuthNav from "@/app/components/AuthNav";
import ProfileForm from "@/app/components/ProfileForm";
import { requireSession } from "@/app/lib/session";
import { ProfileViewModel } from "@/app/viewmodels/ProfileViewModel";

export default async function ProfilePage() {
  const session = await requireSession();

  const data = await new ProfileViewModel().load(session.userId, session.role);
  if (!data) {
    redirect("/");
  }

  const roleLabel =
    session.role === "trainer"
      ? "Trener nalog"
      : session.role === "admin"
        ? "Administrator nalog"
        : "Klijent nalog";

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

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-bold">Moj profil</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {roleLabel} — izmeni svoje podatke.
          </p>

          <ProfileForm data={data} />
        </div>
      </main>
    </div>
  );
}
