import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Lozinka za sve seed naloge: "trener123" (heširana pri unosu)
type SeedTrainer = {
  name: string;
  email: string;
  specialty: string;
  city: string;
  pricePerMonth: number;
  rating: number;
  status?: "PENDING" | "ACTIVE" | "BANNED";
};

const trainers: SeedTrainer[] = [
  { name: "Ana Jovanović", email: "ana.jovanovic@gmail.com", specialty: "Snaga i kondicija", city: "Beograd", pricePerMonth: 2500, rating: 9.4 },
  { name: "Marko Ilić", email: "marko.ilic@gmail.com", specialty: "Mršavljenje", city: "Novi Sad", pricePerMonth: 2200, rating: 8.1 },
  { name: "Sale Lazic", email: "sale.lazic@gmail.com", specialty: "Teretana", city: "Novi Sad", pricePerMonth: 7000, rating: 10.0 },
  { name: "Stefan Nikolić", email: "stefan.nikolic@gmail.com", specialty: "Bodybuilding", city: "Beograd", pricePerMonth: 3000, rating: 7.6 },
  { name: "Milica Popović", email: "milica.popovic@gmail.com", specialty: "Funkcionalni trening", city: "Kragujevac", pricePerMonth: 2400, rating: 8.9 },
  { name: "Nikola Đorđević", email: "nikola.djordjevic@gmail.com", specialty: "Kardio i izdržljivost", city: "Novi Sad", pricePerMonth: 2100, rating: 6.7 },
  { name: "Tijana Marić", email: "tijana.maric@gmail.com", specialty: "Pilates", city: "Beograd", pricePerMonth: 2300, rating: 9.1 },
  { name: "Luka Petrović", email: "luka.petrovic@gmail.com", specialty: "CrossFit", city: "Subotica", pricePerMonth: 2600, rating: 8.3 },
  { name: "Ivana Lukić", email: "ivana.lukic@gmail.com", specialty: "Snaga i kondicija", city: "Niš", pricePerMonth: 2150, rating: 7.2 },
  { name: "Vladimir Stojanović", email: "vladimir.stojanovic@gmail.com", specialty: "Bodybuilding", city: "Beograd", pricePerMonth: 3200, rating: 9.6 },
  // Test trener za laku prijavu (glavni nalog za demonstraciju)
  { name: "Trener Test", email: "trener@gmail.com", specialty: "Snaga i kondicija", city: "Beograd", pricePerMonth: 2000, rating: 8.0 },
  // Trener koji čeka odobrenje admina (za demo odobravanja)
  { name: "Pending Trener", email: "pending@gmail.com", specialty: "Joga", city: "Beograd", pricePerMonth: 2000, rating: 1.0, status: "PENDING" },
  // Banovani trener (za demo odbanovanja)
  { name: "Banovani Trener", email: "banned@gmail.com", specialty: "Boks", city: "Niš", pricePerMonth: 1800, rating: 5.0, status: "BANNED" },
];

type SeedClient = {
  name: string;
  email: string;
  height: number;
  weight: number;
  age: number;
};

const clients: SeedClient[] = [
  { name: "Klijent Prvi", email: "klijent@gmail.com", height: 182, weight: 80, age: 28 },
  { name: "Klijent Drugi", email: "klijent2@gmail.com", height: 170, weight: 66, age: 24 },
  { name: "Klijent Treći", email: "klijent3@gmail.com", height: 190, weight: 95, age: 33 },
];

const admins = [{ name: "Administrator", email: "admin@gmail.com" }];

// Bazna oprema (katalog koji kreira admin) — klijenti je označavaju kao svoju.
const baseEquipment: {
  name: string;
  description: string;
  type: "SPRAVA" | "REKVIZIT";
}[] = [
  { name: "Guma za istezanje", description: "Elastična guma za trening otpora.", type: "REKVIZIT" },
  { name: "Teg 5kg", description: "Ručni teg od 5 kilograma.", type: "REKVIZIT" },
  { name: "Bučice 10kg", description: "Par bučica od 10 kilograma.", type: "REKVIZIT" },
  { name: "Prostirka za jogu", description: "Podloga za vežbanje i istezanje.", type: "REKVIZIT" },
  { name: "Klupa za vežbanje", description: "Podesiva klupa za vežbe sa tegovima.", type: "SPRAVA" },
  { name: "Traka za trčanje", description: "Traka za kardio trening.", type: "SPRAVA" },
];

async function recomputeTrainerRating(trainerId: number) {
  const agg = await prisma.trainerReview.aggregate({
    where: { trainerId },
    _avg: { rating: true },
  });
  await prisma.trainer.update({
    where: { id: trainerId },
    data: { rating: agg._avg.rating ?? 1.0 },
  });
}

async function recomputeClientRating(clientId: number) {
  const agg = await prisma.clientReview.aggregate({
    where: { clientId },
    _avg: { rating: true },
  });
  await prisma.client.update({
    where: { id: clientId },
    data: { rating: agg._avg.rating ?? 0 },
  });
}

/**
 * Relacioni podaci (vežbe, zahtevi, treninzi, ocene, oprema).
 * Pokreće se samo na praznoj bazi (nema zahteva) da bi ostalo idempotentno.
 */
async function seedRelational() {
  const trener = await prisma.trainer.findUniqueOrThrow({ where: { email: "trener@gmail.com" } });
  const ana = await prisma.trainer.findUniqueOrThrow({ where: { email: "ana.jovanovic@gmail.com" } });
  const k1 = await prisma.client.findUniqueOrThrow({ where: { email: "klijent@gmail.com" } });
  const k2 = await prisma.client.findUniqueOrThrow({ where: { email: "klijent2@gmail.com" } });
  const k3 = await prisma.client.findUniqueOrThrow({ where: { email: "klijent3@gmail.com" } });

  // Vežbe za Trener Test
  const exerciseDefs: {
    name: string;
    description: string;
    category: "SPRAVA" | "REKVIZIT" | "BODYWEIGHT";
  }[] = [
    { name: "Čučanj", description: "Osnovni čučanj sa sopstvenom težinom.", category: "BODYWEIGHT" },
    { name: "Iskorak", description: "Iskorak napred, naizmenično nogama.", category: "BODYWEIGHT" },
    { name: "Mrtvo dizanje", description: "Podizanje šipke sa poda, ravna leđa.", category: "SPRAVA" },
    { name: "Potisak sa grudi", description: "Potisak šipke na ravnoj klupi.", category: "SPRAVA" },
    { name: "Sklek", description: "Sklekovi na podu.", category: "BODYWEIGHT" },
    { name: "Zgib", description: "Zgibovi na vratilu, pun opseg.", category: "BODYWEIGHT" },
  ];
  const exId: Record<string, number> = {};
  for (const e of exerciseDefs) {
    const created = await prisma.exercise.create({
      data: { ...e, trainerId: trener.id },
    });
    exId[e.name] = created.id;
  }

  // Zahtevi za Trener Test: ACCEPTED, PENDING, REJECTED + jedan ka Ani (ACCEPTED)
  await prisma.trainerRequest.createMany({
    data: [
      { clientId: k1.id, trainerId: trener.id, message: "Želim da poboljšam snagu i tehniku podizanja.", status: "ACCEPTED", respondedAt: new Date() },
      { clientId: k2.id, trainerId: trener.id, message: "Zanima me program za mršavljenje i kondiciju.", status: "PENDING" },
      { clientId: k3.id, trainerId: trener.id, message: "Tražim trening prilagođen početnicima.", status: "REJECTED", respondedAt: new Date() },
      { clientId: k1.id, trainerId: ana.id, message: "Interesuje me rad na kondiciji i izdržljivosti.", status: "ACCEPTED", respondedAt: new Date() },
    ],
  });

  // Treninzi koje Trener Test daje Klijentu Prvi
  await prisma.training.create({
    data: {
      title: "Trening nogu",
      scheduledFor: new Date("2026-07-20"),
      trainerId: trener.id,
      clientId: k1.id,
      trainingRating: 9,
      trainingComment: "Odličan trening, oseti se napredak u snazi!",
      blocks: {
        create: [
          { exerciseId: exId["Čučanj"], position: 0, sets: 4, repetitions: 12, restSeconds: 90, notes: "Kontrolisano spuštanje do paralele.", clientRating: 5 },
          { exerciseId: exId["Iskorak"], position: 1, sets: 3, repetitions: 10, restSeconds: 60, notes: "", clientRating: 4 },
          { exerciseId: exId["Mrtvo dizanje"], position: 2, sets: 3, repetitions: 8, restSeconds: 120, notes: "Održavaj ravna leđa.", clientRating: null },
        ],
      },
    },
  });
  await prisma.training.create({
    data: {
      title: "Gornji deo tela",
      scheduledFor: new Date("2026-07-23"),
      trainerId: trener.id,
      clientId: k1.id,
      blocks: {
        create: [
          { exerciseId: exId["Potisak sa grudi"], position: 0, sets: 4, repetitions: 10, restSeconds: 90, notes: "" },
          { exerciseId: exId["Sklek"], position: 1, sets: 3, repetitions: 15, restSeconds: 60, notes: "" },
          { exerciseId: exId["Zgib"], position: 2, sets: 3, repetitions: 8, restSeconds: 90, notes: "Pun opseg pokreta." },
        ],
      },
    },
  });

  // Ocene trenera (klijent → trener) + preračun proseka
  await prisma.trainerReview.createMany({
    data: [
      { trainerId: trener.id, clientId: k1.id, rating: 9, comment: "Motiviše i sve objašnjava jasno. Velika preporuka!" },
      { trainerId: ana.id, clientId: k1.id, rating: 8, comment: "Profesionalna i posvećena treninzima." },
    ],
  });
  await recomputeTrainerRating(trener.id);
  await recomputeTrainerRating(ana.id);

  // Ocena klijenta (trener → klijent) + preračun proseka
  await prisma.clientReview.create({
    data: { trainerId: trener.id, clientId: k1.id, rating: 8, comment: "Redovan i vredan, poštuje plan treninga." },
  });
  await recomputeClientRating(k1.id);

  // Oprema klijenata (bazna iz kataloga + jedna custom)
  const teg = await prisma.equipment.findFirstOrThrow({ where: { name: "Teg 5kg", isBase: true } });
  const bucice = await prisma.equipment.findFirstOrThrow({ where: { name: "Bučice 10kg", isBase: true } });
  const prostirka = await prisma.equipment.findFirstOrThrow({ where: { name: "Prostirka za jogu", isBase: true } });
  const custom = await prisma.equipment.create({
    data: { name: "Improvizovana šipka", description: "Domaća šipka za zgibove.", type: "SPRAVA", isBase: false, createdById: k1.id },
  });
  await prisma.clientEquipment.createMany({
    data: [
      { clientId: k1.id, equipmentId: teg.id },
      { clientId: k1.id, equipmentId: bucice.id },
      { clientId: k1.id, equipmentId: custom.id },
      { clientId: k2.id, equipmentId: prostirka.id },
    ],
  });
}

async function main() {
  const password = await bcrypt.hash("trener123", 10);

  for (const t of trainers) {
    await prisma.trainer.upsert({
      where: { email: t.email },
      update: {}, // ne diramo postojeće naloge
      create: {
        name: t.name,
        email: t.email,
        specialty: t.specialty,
        city: t.city,
        pricePerMonth: t.pricePerMonth,
        rating: t.rating,
        password,
        status: t.status ?? "ACTIVE",
      },
    });
  }

  for (const c of clients) {
    await prisma.client.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        password,
        height: c.height,
        weight: c.weight,
        age: c.age,
      },
    });
  }

  const adminPassword = await bcrypt.hash("admin123", 10);
  for (const a of admins) {
    await prisma.admin.upsert({
      where: { email: a.email },
      update: {},
      create: { ...a, password: adminPassword },
    });
  }

  // Bazna oprema — idempotentno (naziv nije unique, pa proveravamo postojanje).
  for (const e of baseEquipment) {
    const existing = await prisma.equipment.findFirst({
      where: { name: e.name, isBase: true },
      select: { id: true },
    });
    if (!existing) {
      await prisma.equipment.create({
        data: { ...e, isBase: true, createdById: null },
      });
    }
  }

  // Relacioni demo podaci — samo na praznoj bazi (idempotentno).
  if ((await prisma.trainerRequest.count()) === 0) {
    await seedRelational();
  }

  console.log(
    [
      "Seed gotov:",
      `${trainers.length} trenera (uklj. 1 PENDING + 1 BANNED), ${clients.length} klijenata, ${admins.length} admin, ${baseEquipment.length} baznih oprema.`,
      'Nalozi (lozinka trenera/klijenata: "trener123", admin: "admin123"):',
      "  trener@gmail.com (glavni trener), pending@gmail.com, banned@gmail.com",
      "  klijent@gmail.com (ima trenere, treninge, ocene, opremu), klijent2@gmail.com, klijent3@gmail.com",
      "  admin@gmail.com",
    ].join("\n"),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
