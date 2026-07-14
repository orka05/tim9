# Tim 9 — Aplikacija za pronalaženje trenera

Web aplikacija za pronalaženje ličnih trenera, izrađena u **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4** i **Prisma ORM** sa **PostgreSQL** bazom.

## Tehnologije

| Sloj      | Tehnologija                     |
| --------- | ------------------------------- |
| Framework | Next.js 16 (App Router)         |
| Jezik     | TypeScript                      |
| Stilovi   | Tailwind CSS v4                 |
| Baza      | PostgreSQL                      |
| ORM       | Prisma 7 (`@prisma/adapter-pg`) |

---

## Pokretanje projekta

### 1. Preduslovi

Instalirani:

- [Node.js](https://nodejs.org/) (verzija 20 ili novija)
- [PostgreSQL](https://www.postgresql.org/download/) (+ opciono pgAdmin)
- [Git](https://git-scm.com/)

### 2. Kloniraj repozitorijum

```bash
git clone <URL_REPOZITORIJUMA>
cd tim9-app
```

### 3. Instaliraj sve zavisnosti jednom komandom

Sve zavisnosti su navedene u `package.json`. Dovoljno je pokrenuti:

```bash
npm install
```

> Ovo skida sve potrebne pakete i automatski pokreće `prisma generate`
> (zahvaljujući `postinstall` skripti) — nije potrebno ništa dodatno ručno instalirati.

### 4. Napravi bazu u PostgreSQL-u

U pgAdmin (ili `psql`) napravi praznu bazu pod imenom **`tim9`**.

### 5. Podesi konekciju (`.env`)

Kopiraj `.env.example` u `.env` i upiši svoje podatke (korisnik, lozinka, ime baze):

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:TVOJA_LOZINKA@localhost:5432/tim9?schema=public"
```

> `.env` se **ne** commit-uje na Git (svako ima svoju lozinku). Šablon je u `.env.example`.

### 6. Napravi tabele i ubaci početne podatke

```bash
npm run db:setup
```

Ovo pokrene migracije (kreira sve tabele) **i** ubaci početne podatke preko seed skripte
`prisma/seed.ts` — **10 trenera** (različite ocene), **test trener** `trener@mail.com`, i
**3 klijenta** (`klijent@gmail.com`, `klijent2@gmail.com`, `klijent3@gmail.com`).
Lozinka za sve seed naloge je `trener123`.

> Seed je idempotentan (koristi `upsert`) — možeš ga pokrenuti više puta bez duplikata:
> `npm run db:seed`. Za Čist restart baze: `npm run db:reset` pa `npm run db:seed`.

### 7. Pokreni aplikaciju

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000).

---

## Korisne komande

| Komanda              | Opis                             |
| -------------------- | -------------------------------- |
| `npm run dev`        | Pokreće development server       |
| `npm run db:setup`   | Migracije + seed (sve odjednom)  |
| `npm run db:migrate` | Primeni Prisma migracije na bazu |
| `npm run db:seed`    | Ubaci početne podatke (seed)     |
| `npm run db:reset`   | Obriši i ponovo napravi bazu     |
| `npx prisma studio`  | Vizuelni pregled baze u browseru |

## Struktura projekta

```
app/
  components/       # Reusable komponente (Logo, dugmad, ThemeToggle)
  generated/        # Prisma client (auto-generisan, nije na Git-u)
  lib/prisma.ts     # Prisma client singleton
  login/            # /login stranica
  register/         # /register stranica
  trainers/         # /trainers — pretraga trenera
  layout.tsx        # Root layout
  page.tsx          # Landing stranica
prisma/
  schema.prisma     # Šema baze (modeli)
  migrations/       # Istorija migracija
```
