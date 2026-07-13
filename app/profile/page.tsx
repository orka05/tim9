import { redirect } from "next/navigation";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import AuthNav from "../components/AuthNav";
import ProfileForm from "../components/ProfileForm";
import { requireSession } from "../lib/session";
import { prisma } from "../lib/prisma";

export default async function ProfilePage() {
  const session = await requireSession();

  const isTrainer = session.role === "trainer";

  let data;
  if (isTrainer) {
    const trainer = await prisma.trainer.findUnique({
      where: { id: session.userId },
    });
    if (!trainer) {
      redirect("/");
    }
    data = {
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      createdAt: trainer.createdAt.toISOString(),
      role: "trainer" as const,
      specialty: trainer.specialty,
      city: trainer.city,
      pricePerSession: trainer.pricePerSession,
      rating: trainer.rating,
    };
  } else {
    const client = await prisma.client.findUnique({
      where: { id: session.userId },
    });
    if (!client) {
      redirect("/");
    }
    data = {
      id: client.id,
      name: client.name,
      email: client.email,
      createdAt: client.createdAt.toISOString(),
      role: "client" as const,
    };
  }

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
            {isTrainer ? "Trener nalog" : "Klijent nalog"} — izmeni svoje podatke.
          </p>

          <ProfileForm data={data} />
        </div>
      </main>
    </div>
  );
}
