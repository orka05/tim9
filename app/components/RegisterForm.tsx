"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction, type AuthState } from "../lib/actions";

const initialState: AuthState = {};

export default function RegisterForm() {
  const [role, setRole] = useState<"client" | "trainer">("client");
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-5">
      <input type="hidden" name="role" value={role} />

      {/* Tip naloga */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={
            role === "client"
              ? "rounded-lg border border-indigo-500 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              : "rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          }
        >
          Tražim trenera
        </button>
        <button
          type="button"
          onClick={() => setRole("trainer")}
          className={
            role === "trainer"
              ? "rounded-lg border border-indigo-500 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              : "rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          }
        >
          Ja sam trener
        </button>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.info && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400">
          {state.info}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Ime i prezime
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
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
          name="email"
          type="email"
          required
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
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          required
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
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Kreiranje..." : "Kreiraj nalog"}
      </button>
    </form>
  );
}
