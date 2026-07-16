"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { createSession, destroySession, requireSession } from "./session";

export type AuthState = { error?: string; info?: string };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "client") as "client" | "trainer";

  if (!name || !email || !password) {
    return { error: "Sva polja su obavezna." };
  }
  if (!emailRegex.test(email)) {
    return { error: "Unesi ispravnu email adresu." };
  }
  if (password.length < 6) {
    return { error: "Lozinka mora imati bar 6 karaktera." };
  }
  if (role !== "client" && role !== "trainer") {
    return { error: "Nepoznat tip naloga." };
  }

  // Email mora biti jedinstven u svim tabelama naloga
  const [existingClient, existingTrainer, existingAdmin] = await Promise.all([
    prisma.client.findUnique({ where: { email } }),
    prisma.trainer.findUnique({ where: { email } }),
    prisma.admin.findUnique({ where: { email } }),
  ]);
  if (existingClient || existingTrainer || existingAdmin) {
    return { error: "Nalog sa ovom email adresom već postoji." };
  }

  const hashed = await bcrypt.hash(password, 10);

  if (role === "trainer") {
    // Trener nalog nije odmah aktivan — čeka odobrenje administratora
    await prisma.trainer.create({
      data: { name, email, password: hashed },
    });
    return {
      info: "Zahtev za nalog trenera je poslat administratoru na odobrenje. Bićeš obavešten kada bude odobren.",
    };
  }

  const client = await prisma.client.create({
    data: { name, email, password: hashed },
  });
  await createSession({ userId: client.id, role: "client", name: client.name });

  redirect("/");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Unesi email i lozinku." };
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  const client = admin
    ? null
    : await prisma.client.findUnique({ where: { email } });
  const trainer =
    admin || client
      ? null
      : await prisma.trainer.findUnique({ where: { email } });

  const account = admin
    ? { ...admin, role: "admin" as const }
    : client
      ? { ...client, role: "client" as const }
      : trainer
        ? { ...trainer, role: "trainer" as const }
        : null;

  if (!account) {
    return { error: "Pogrešan email ili lozinka." };
  }

  const valid = await bcrypt.compare(password, account.password);
  if (!valid) {
    return { error: "Pogrešan email ili lozinka." };
  }

  // Trener mora biti odobren od strane administratora
  if (trainer) {
    if (trainer.status === "PENDING") {
      return { error: "Tvoj nalog još uvek čeka odobrenje administratora." };
    }
    if (trainer.status === "BANNED") {
      return { error: "Tvoj nalog je deaktiviran. Obrati se administratoru." };
    }
  }

  await createSession({
    userId: account.id,
    role: account.role,
    name: account.name,
  });

  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) {
    return { error: "Ime i email su obavezni." };
  }
  if (!emailRegex.test(email)) {
    return { error: "Unesi ispravnu email adresu." };
  }
  if (password && password.length < 6) {
    return { error: "Nova lozinka mora imati bar 6 karaktera." };
  }

  // Email mora ostati jedinstven (u svim tabelama naloga), izuzev sopstvenog naloga
  const [clientWithEmail, trainerWithEmail, adminWithEmail] = await Promise.all([
    prisma.client.findUnique({ where: { email } }),
    prisma.trainer.findUnique({ where: { email } }),
    prisma.admin.findUnique({ where: { email } }),
  ]);
  const takenByOther =
    (clientWithEmail &&
      !(session.role === "client" && clientWithEmail.id === session.userId)) ||
    (trainerWithEmail &&
      !(session.role === "trainer" && trainerWithEmail.id === session.userId)) ||
    (adminWithEmail &&
      !(session.role === "admin" && adminWithEmail.id === session.userId));
  if (takenByOther) {
    return { error: "Email adresa je već zauzeta." };
  }

  const passwordData = password
    ? { password: await bcrypt.hash(password, 10) }
    : {};

  if (session.role === "trainer") {
    const specialty = String(formData.get("specialty") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const pricePerSession = Number(formData.get("pricePerSession") ?? 0);
    if (!Number.isFinite(pricePerSession) || pricePerSession < 0) {
      return { error: "Cena po sesiji mora biti pozitivan broj." };
    }
    await prisma.trainer.update({
      where: { id: session.userId },
      data: { name, email, specialty, city, pricePerSession, ...passwordData },
    });
  } else if (session.role === "admin") {
    await prisma.admin.update({
      where: { id: session.userId },
      data: { name, email, ...passwordData },
    });
  } else {
    await prisma.client.update({
      where: { id: session.userId },
      data: { name, email, ...passwordData },
    });
  }

  // Osvezi sesiju sa novim imenom
  await createSession({
    userId: session.userId,
    role: session.role,
    name,
  });

  return { success: true };
}

export type TrainerRequestState = { error?: string; success?: boolean };

export async function sendTrainerRequestAction(
  _prev: TrainerRequestState,
  formData: FormData,
): Promise<TrainerRequestState> {
  const session = await requireSession();
  if (session.role !== "client") {
    return { error: "Samo klijenti mogu slati zahteve trenerima." };
  }

  const trainerId = Number(formData.get("trainerId"));
  const message = String(formData.get("message") ?? "").trim();

  if (!Number.isInteger(trainerId) || trainerId <= 0) {
    return { error: "Izabrani trener nije ispravan." };
  }
  if (!message) {
    return { error: "Napiši poruku treneru." };
  }
  if (message.length > 1000) {
    return { error: "Poruka može imati najviše 1000 karaktera." };
  }

  const [trainer, existingRequest] = await Promise.all([
    prisma.trainer.findUnique({ where: { id: trainerId }, select: { id: true } }),
    prisma.trainerRequest.findFirst({
      where: {
        clientId: session.userId,
        trainerId,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      select: { status: true },
      orderBy: { status: "desc" },
    }),
  ]);

  if (!trainer) {
    return { error: "Trener više nije dostupan." };
  }
  if (existingRequest?.status === "ACCEPTED") {
    return { error: "Trener je već prihvatio tvoj zahtev." };
  }
  if (existingRequest?.status === "PENDING") {
    return { error: "Već imaš zahtev na čekanju kod ovog trenera." };
  }

  try {
    await prisma.trainerRequest.create({
      data: { clientId: session.userId, trainerId, message },
    });
  } catch {
    return { error: "Zahtev nije poslat. Pokušaj ponovo." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function respondTrainerRequestAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "trainer") {
    redirect("/");
  }

  const requestId = Number(formData.get("requestId"));
  const decision = String(formData.get("decision"));
  if (!Number.isInteger(requestId) || requestId <= 0) return;
  if (decision !== "ACCEPTED" && decision !== "REJECTED") return;

  await prisma.trainerRequest.updateMany({
    where: {
      id: requestId,
      trainerId: session.userId,
      status: "PENDING",
    },
    data: {
      status: decision,
      respondedAt: new Date(),
    },
  });

  revalidatePath("/");
}

export async function deleteTrainerAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/");
  }

  const trainerId = Number(formData.get("trainerId"));
  if (!Number.isInteger(trainerId) || trainerId <= 0) return;

  // „Brisanje“ = ban: nalog se deaktivira umesto trajnog brisanja
  await prisma.trainer.updateMany({
    where: { id: trainerId },
    data: { status: "BANNED" },
  });

  revalidatePath("/");
}

export async function approveTrainerAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/");
  }

  const trainerId = Number(formData.get("trainerId"));
  if (!Number.isInteger(trainerId) || trainerId <= 0) return;

  await prisma.trainer.updateMany({
    where: { id: trainerId, status: "PENDING" },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/zahtevi-trenera");
  revalidatePath("/");
}

export async function unbanTrainerAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/");
  }

  const trainerId = Number(formData.get("trainerId"));
  if (!Number.isInteger(trainerId) || trainerId <= 0) return;

  await prisma.trainer.updateMany({
    where: { id: trainerId, status: "BANNED" },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/banovani-treneri");
  revalidatePath("/");
}
