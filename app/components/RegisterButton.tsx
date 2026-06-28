import Link from "next/link";

export default function RegisterButton({
  label = "Registracija",
}: {
  label?: string;
}) {
  return (
    <Link
      href="/register"
      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 sm:px-4"
    >
      {label}
    </Link>
  );
}
