import Link from "next/link";

export default function LoginButton({
  label = "Prijava",
}: {
  label?: string;
}) {
  return (
    <Link
      href="/login"
      className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:px-4"
    >
      {label}
    </Link>
  );
}
