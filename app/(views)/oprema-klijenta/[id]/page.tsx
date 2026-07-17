import { notFound, redirect } from "next/navigation";
import Logo from "@/app/components/Logo";
import AuthNav from "@/app/components/AuthNav";
import ThemeToggle from "@/app/components/ThemeToggle";
import { requireSession } from "@/app/lib/session";
import { EQUIPMENT_TYPE_BY_VALUE } from "@/app/lib/equipmentTypes";
import ClientRatingForm from "@/app/components/ClientRatingForm";
import { TrainerClientEquipmentViewModel } from "@/app/viewmodels/TrainerClientEquipmentViewModel";

export default async function OpremaKlijentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (session.role !== "trainer") redirect("/");

  const { id: rawId } = await params;
  const clientId = Number(rawId);
  if (!Number.isInteger(clientId) || clientId <= 0) notFound();

  const data = await new TrainerClientEquipmentViewModel().load(
    session.userId,
    clientId,
  );
  if (!data) notFound();

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
          Podaci o klijentu
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Podaci i oprema koju poseduje{" "}
          <span className="font-semibold">{data.clientName}</span>.
        </p>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Fizički podaci</h2>
          <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-zinc-500">Visina</dt>
              <dd className="mt-0.5 text-lg font-semibold">
                {data.height != null ? `${data.height} cm` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Težina</dt>
              <dd className="mt-0.5 text-lg font-semibold">
                {data.weight != null ? `${data.weight} kg` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Godine</dt>
              <dd className="mt-0.5 text-lg font-semibold">
                {data.age != null ? data.age : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Ocena klijenta</h2>
            <span className="text-sm font-semibold text-amber-500">
              {data.reviewCount > 0
                ? `★ ${data.clientRating.toFixed(1)} (${data.reviewCount})`
                : "Još nema ocena"}
            </span>
          </div>

          {data.canRate ? (
            <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Oceni klijenta (kakav je bio u saradnji)
              </p>
              <ClientRatingForm
                clientId={clientId}
                initialRating={data.myRating}
                initialComment={data.myComment}
              />
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              Klijenta možeš oceniti tek kada prihvatiš njegov zahtev.
            </p>
          )}

          {data.reviews.length > 0 && (
            <ul className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              {data.reviews.map((review, index) => (
                <li
                  key={index}
                  className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 font-semibold">
                      {review.trainerName}
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-amber-500">
                      ★ {review.rating}/10
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">{review.date}</p>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-zinc-400">
                      Bez komentara
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <h2 className="mt-10 text-2xl font-bold tracking-tight">Oprema</h2>
        <p className="mt-2 text-sm text-zinc-500">
          {data.equipment.length === 0
            ? "Ovaj klijent još nema unetu opremu."
            : `Ukupno opreme: ${data.equipment.length}`}
        </p>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {data.equipment.map((item) => {
            const type = EQUIPMENT_TYPE_BY_VALUE[item.type];
            return (
              <li
                key={item.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-lg font-semibold">{item.name}</h3>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        type?.badge ??
                        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {type?.label ?? item.type}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.isCustom
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {item.isCustom ? "Custom" : "Iz kataloga"}
                    </span>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </main>

      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} Sva prava zadržana Tim9.
      </footer>
    </div>
  );
}
