"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, requireSession } from "./session";
import { TrainerRepository } from "../repositories/TrainerRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { AdminRepository } from "../repositories/AdminRepository";
import { TrainerRequestRepository } from "../repositories/TrainerRequestRepository";

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
    ClientRepository.findByEmail(email),
    TrainerRepository.findByEmail(email),
    AdminRepository.findByEmail(email),
  ]);
  if (existingClient || existingTrainer || existingAdmin) {
    return { error: "Nalog sa ovom email adresom već postoji." };
  }

  const hashed = await bcrypt.hash(password, 10);

  if (role === "trainer") {
    // Trener nalog nije odmah aktivan — čeka odobrenje administratora
    await TrainerRepository.create({ name, email, password: hashed });
    return {
      info: "Zahtev za nalog trenera je poslat administratoru na odobrenje. Bićeš obavešten kada bude odobren.",
    };
  }

  const client = await ClientRepository.create({ name, email, password: hashed });
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

  const admin = await AdminRepository.findByEmail(email);
  const client = admin ? null : await ClientRepository.findByEmail(email);
  const trainer =
    admin || client ? null : await TrainerRepository.findByEmail(email);

  const account = admin
    ? { id: admin.id, name: admin.name, password: admin.password, role: "admin" as const }
    : client
      ? { id: client.id, name: client.name, password: client.password, role: "client" as const }
      : trainer
        ? { id: trainer.id, name: trainer.name, password: trainer.password, role: "trainer" as const }
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
    ClientRepository.findByEmail(email),
    TrainerRepository.findByEmail(email),
    AdminRepository.findByEmail(email),
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

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  if (session.role === "trainer") {
    const specialty = String(formData.get("specialty") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const pricePerMonth = Number(formData.get("pricePerMonth") ?? 0);
    if (!Number.isFinite(pricePerMonth) || pricePerMonth < 0) {
      return { error: "Mesečna cena mora biti pozitivan broj." };
    }
    await TrainerRepository.updateProfile(session.userId, {
      name,
      email,
      specialty,
      city,
      pricePerMonth,
      password: hashedPassword,
    });
  } else if (session.role === "admin") {
    await AdminRepository.updateProfile(session.userId, {
      name,
      email,
      password: hashedPassword,
    });
  } else {
    const parseMetric = (
      raw: FormDataEntryValue | null,
      min: number,
      max: number,
    ): { ok: true; value: number | null } | { ok: false } => {
      const str = String(raw ?? "").trim();
      if (str === "") return { ok: true, value: null };
      const n = Number(str);
      if (!Number.isInteger(n) || n < min || n > max) return { ok: false };
      return { ok: true, value: n };
    };

    const height = parseMetric(formData.get("height"), 50, 300);
    const weight = parseMetric(formData.get("weight"), 20, 500);
    const age = parseMetric(formData.get("age"), 5, 120);
    if (!height.ok) {
      return { error: "Visina mora biti ceo broj između 50 i 300 cm." };
    }
    if (!weight.ok) {
      return { error: "Težina mora biti ceo broj između 20 i 500 kg." };
    }
    if (!age.ok) {
      return { error: "Godine moraju biti ceo broj između 5 i 120." };
    }

    await ClientRepository.updateProfile(session.userId, {
      name,
      email,
      password: hashedPassword,
      height: height.value,
      weight: weight.value,
      age: age.value,
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

  const [trainer, existingStatus] = await Promise.all([
    TrainerRepository.findById(trainerId),
    TrainerRequestRepository.findActiveStatusBetween(session.userId, trainerId),
  ]);

  if (!trainer) {
    return { error: "Trener više nije dostupan." };
  }
  if (existingStatus === "ACCEPTED") {
    return { error: "Trener je već prihvatio tvoj zahtev." };
  }
  if (existingStatus === "PENDING") {
    return { error: "Već imaš zahtev na čekanju kod ovog trenera." };
  }

  try {
    await TrainerRequestRepository.create({
      clientId: session.userId,
      trainerId,
      message,
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

  await TrainerRequestRepository.respondPending(
    requestId,
    session.userId,
    decision,
  );

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
  await TrainerRepository.ban(trainerId);

  revalidatePath("/");
}

export async function approveTrainerAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/");
  }

  const trainerId = Number(formData.get("trainerId"));
  if (!Number.isInteger(trainerId) || trainerId <= 0) return;

  await TrainerRepository.approve(trainerId);

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

  await TrainerRepository.activate(trainerId);

  revalidatePath("/banovani-treneri");
  revalidatePath("/");
}
