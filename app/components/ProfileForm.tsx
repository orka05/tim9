"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileState } from "../lib/actions";

const initialState: ProfileState = {};

type ProfileData = {
  id: number;
  name: string;
  email: string;
  role: "client" | "trainer" | "admin";
  specialty?: string;
  city?: string;
  pricePerMonth?: number;
  rating?: number;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
};

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900";

const readonlyClass =
  "cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2.5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-500";

export default function ProfileForm({ data }: { data: ProfileData }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400">
          Podaci su uspešno sačuvani.
        </p>
      )}

      {/* ID — samo za prikaz */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="id" className="text-sm font-medium">
          ID naloga
        </label>
        <input id="id" type="text" value={data.id} disabled className={readonlyClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Ime i prezime
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={data.name}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email adresa
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={data.email}
          className={inputClass}
        />
      </div>

      {data.role === "trainer" && (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="specialty" className="text-sm font-medium">
              Specijalnost
            </label>
            <input
              id="specialty"
              name="specialty"
              type="text"
              placeholder="npr. Snaga i kondicija"
              defaultValue={data.specialty ?? ""}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className="text-sm font-medium">
              Grad
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="npr. Beograd"
              defaultValue={data.city ?? ""}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="pricePerMonth" className="text-sm font-medium">
              Mesečna cena (RSD)
            </label>
            <input
              id="pricePerMonth"
              name="pricePerMonth"
              type="number"
              min={0}
              defaultValue={data.pricePerMonth ?? 0}
              className={inputClass}
            />
          </div>

          {/* Ocenu dodeljuju korisnici — samo za prikaz */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rating" className="text-sm font-medium">
              Ocena{" "}
              <span className="font-normal text-zinc-400">
                (dodeljuju korisnici)
              </span>
            </label>
            <input
              id="rating"
              type="text"
              value={(data.rating ?? 0).toFixed(1)}
              disabled
              className={readonlyClass}
            />
          </div>
        </>
      )}

      {data.role === "client" && (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="clientRating" className="text-sm font-medium">
              Tvoja ocena kao klijent{" "}
              <span className="font-normal text-zinc-400">
                (dodeljuju treneri)
              </span>
            </label>
            <input
              id="clientRating"
              type="text"
              value={
                (data.rating ?? 0) > 0
                  ? (data.rating ?? 0).toFixed(1)
                  : "Još nema ocena"
              }
              disabled
              className={readonlyClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="height" className="text-sm font-medium">
              Visina (cm)
            </label>
            <input
              id="height"
              name="height"
              type="number"
              min={50}
              max={300}
              placeholder="npr. 180"
              defaultValue={data.height ?? ""}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="weight" className="text-sm font-medium">
              Težina (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              min={20}
              max={500}
              placeholder="npr. 78"
              defaultValue={data.weight ?? ""}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="age" className="text-sm font-medium">
              Godine
            </label>
            <input
              id="age"
              name="age"
              type="number"
              min={5}
              max={120}
              placeholder="npr. 27"
              defaultValue={data.age ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Nova lozinka{" "}
          <span className="font-normal text-zinc-400">
            (ostavi prazno ako ne menjaš)
          </span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Čuvanje..." : "Sačuvaj izmene"}
      </button>
    </form>
  );
}
