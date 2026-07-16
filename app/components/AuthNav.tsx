import { getSession } from "../lib/session";
import { logoutAction } from "../lib/actions";
import Link from "next/link";
import LoginButton from "./LoginButton";
import RegisterButton from "./RegisterButton";

export default async function AuthNav() {
  const session = await getSession();

  if (!session) {
    return (
      <>
        <LoginButton />
        <RegisterButton />
      </>
    );
  }

return (
    <>
      {session.role === "trainer" && (
        <Link
          href="/equipment"
          className="text-sm font-medium text-zinc-700 transition hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
        >
          Sprave
        </Link>
      )}
      <Link
        href="/profile"
        className="text-sm font-bold text-zinc-900 transition hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
      >
        {session.name}
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:px-4"
        >
          Odjavi se
        </button>
      </form>
    </>
  );
}
