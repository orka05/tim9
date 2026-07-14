import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Lozinka za sve seed naloge: "trener123" (heširana pri unosu)
const trainers = [
  { name: "Ana Jovanović", email: "ana.jovanovic@gmail.com", specialty: "Snaga i kondicija", city: "Beograd", pricePerSession: 2500, rating: 9.4 },
  { name: "Marko Ilić", email: "marko.ilic@gmail.com", specialty: "Mršavljenje", city: "Novi Sad", pricePerSession: 2200, rating: 8.1 },
  { name: "Sale Lazic", email: "sale.lazic@gmail.com", specialty: "Teretana", city: "Novi Sad", pricePerSession: 7000, rating: 10.0 },
  { name: "Stefan Nikolić", email: "stefan.nikolic@gmail.com", specialty: "Bodybuilding", city: "Beograd", pricePerSession: 3000, rating: 7.6 },
  { name: "Milica Popović", email: "milica.popovic@gmail.com", specialty: "Funkcionalni trening", city: "Kragujevac", pricePerSession: 2400, rating: 8.9 },
  { name: "Nikola Đorđević", email: "nikola.djordjevic@gmail.com", specialty: "Kardio i izdržljivost", city: "Novi Sad", pricePerSession: 2100, rating: 6.7 },
  { name: "Tijana Marić", email: "tijana.maric@gmail.com", specialty: "Pilates", city: "Beograd", pricePerSession: 2300, rating: 9.1 },
  { name: "Luka Petrović", email: "luka.petrovic@gmail.com", specialty: "CrossFit", city: "Subotica", pricePerSession: 2600, rating: 8.3 },
  { name: "Ivana Lukić", email: "ivana.lukic@gmail.com", specialty: "Snaga i kondicija", city: "Niš", pricePerSession: 2150, rating: 7.2 },
  { name: "Vladimir Stojanović", email: "vladimir.stojanovic@gmail.com", specialty: "Bodybuilding", city: "Beograd", pricePerSession: 3200, rating: 9.6 },
  // Test trener za laku prijavu
  { name: "Trener Test", email: "trener@mail.com", specialty: "Snaga i kondicija", city: "Beograd", pricePerSession: 2000, rating: 8.0 },
];

const clients = [
  { name: "Klijent Prvi", email: "klijent@gmail.com" },
  { name: "Klijent Drugi", email: "klijent2@gmail.com" },
  { name: "Klijent Treći", email: "klijent3@gmail.com" },
];

async function main() {
  const password = await bcrypt.hash("trener123", 10);

  for (const t of trainers) {
    await prisma.trainer.upsert({
      where: { email: t.email },
      update: {}, // ne diramo postojeće naloge
      create: { ...t, password },
    });
  }

  for (const c of clients) {
    await prisma.client.upsert({
      where: { email: c.email },
      update: {},
      create: { ...c, password },
    });
  }

  console.log(
    `Seed gotov: ${trainers.length} trenera, ${clients.length} klijenata (lozinka: "trener123").`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
