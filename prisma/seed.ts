import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Lozinka za sve seed naloge: "trener123" (heširana pri unosu)
const trainers = [
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
  // Test trener za laku prijavu
  { name: "Trener Test", email: "trener@gmail.com", specialty: "Snaga i kondicija", city: "Beograd", pricePerMonth: 2000, rating: 8.0 },
];

const clients = [
  { name: "Klijent Prvi", email: "klijent@gmail.com" },
  { name: "Klijent Drugi", email: "klijent2@gmail.com" },
  { name: "Klijent Treći", email: "klijent3@gmail.com" },
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

async function main() {
  const password = await bcrypt.hash("trener123", 10);

  for (const t of trainers) {
    await prisma.trainer.upsert({
      where: { email: t.email },
      update: {}, // ne diramo postojeće naloge
      create: { ...t, password, status: "ACTIVE" },
    });
  }

  for (const c of clients) {
    await prisma.client.upsert({
      where: { email: c.email },
      update: {},
      create: { ...c, password },
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

  console.log(
    `Seed gotov: ${trainers.length} trenera, ${clients.length} klijenata, ${admins.length} admin, ${baseEquipment.length} baznih oprema (lozinka trenera/klijenata: "trener123", admin: "admin123").`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
