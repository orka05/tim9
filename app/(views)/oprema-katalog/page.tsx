import Logo from "@/app/components/Logo";
import AuthNav from "@/app/components/AuthNav";
import ThemeToggle from "@/app/components/ThemeToggle";
import BaseEquipmentForm from "@/app/components/BaseEquipmentForm";
import BaseEquipmentItem from "@/app/components/BaseEquipmentItem";
import { requireSession } from "@/app/lib/session";
import { AdminEquipmentViewModel } from "@/app/viewmodels/AdminEquipmentViewModel";

export default async function OpremaKatalogPage() {
  const session = await requireSession();

  if (session.role !== "admin") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50 px-4 text-center dark:bg-black">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Ova stranica je dostupna samo administratoru.
        </p>
      </div>
    );
  }

  const catalog = await new AdminEquipmentViewModel().getBaseCatalog();

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
          Katalog opreme
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Bazna oprema dostupna svim klijentima da je označe kao svoju.
        </p>

        <div className="mt-8">
          <BaseEquipmentForm />
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          {catalog.length === 0
            ? "Katalog je prazan. Dodaj prvu baznu opremu."
            : `Ukupno u katalogu: ${catalog.length}`}
        </p>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {catalog.map((item) => (
            <BaseEquipmentItem key={item.id} item={item} />
          ))}
        </ul>
      </main>

      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} Sva prava zadržana Tim9.
      </footer>
    </div>
  );
}
