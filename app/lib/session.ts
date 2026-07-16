import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "client" | "trainer" | "admin";

export type SessionPayload = {
  userId: number;
  role: Role;
  name: string;
};

const COOKIE_NAME = "session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as number,
      role: payload.role as Role,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Modularna zaštita privatnih ruta i akcija.
 * Proverava da li session cookie postoji i da li je validan (potpis + istek).
 * Ako nije — preusmerava korisnika na početnu stranicu.
 * Ako jeste — vraća podatke sesije.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  return session;
}
