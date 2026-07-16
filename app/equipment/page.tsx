import Logo from "../components/Logo";
import AuthNav from "../components/AuthNav";
import ThemeToggle from "../components/ThemeToggle";
import EquipmentForm from "../components/EquipmentForm";
import EquipmentItem from "../components/EquipmentItem";
import { prisma } from "../lib/prisma";
import { requireSession } from "../lib/session";

export default async function EquipmentPage() {
  const session = await requireSession();

  if (session.role !== "trainer") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50 px-4 text-center dark:bg-black">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Ova stranica je dostupna samo trenerima.
        </p>
      </div>
    );
  }

  const equipment = await prisma.equipment.findMany({
    where: { trainerId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <AuthNav />
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Sprave za vežbanje
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Upravljaj spravama koje koristiš na treninzima.
        </p>

        <div className="mt-8">
          <EquipmentForm />
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          {equipment.length === 0
            ? "Još uvek nemaš dodatih sprava."
            : `Ukupno sprava: ${equipment.length}`}
        </p>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {equipment.map((item) => (
            <EquipmentItem
              key={item.id}
              item={{
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.category,
                quantity: item.quantity,
              }}
            />
          ))}
        </ul>
      </main>

      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} Sva prava zadržana Tim9.
      </footer>
    </div>
  );
}