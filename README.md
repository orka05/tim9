# Tim 9 — Veb aplikacija za povezivanje klijenata i ličnih trenera

## 1. Uvod

Projekat predstavlja veb aplikaciju čija je namena posredovanje između korisnika
(klijenata) koji traže usluge ličnog treninga i sertifikovanih trenera. Sistem
omogućava pretragu i pregled trenera, slanje i obradu zahteva za saradnju, kao i
vođenje evidencije vežbi koje trener koristi pri kreiranju treninga. Aplikacija je
realizovana kao full-stack rešenje zasnovano na okruženju Next.js, uz
relacionu bazu podataka PostgreSQL i objektno-relaciono mapiranje (ORM) putem alata
Prisma. Autentifikacija korisnika implementirana je bezbednosno, korišćenjem
heširanja lozinki i potpisanih JWT tokena.

## 2. Funkcionalni zahtevi

- Registracija, prijava i odjava korisnika (uloga klijent ili trener)
- Izmena korisničkih podataka na profilu
- CRUD nad vežbama (sprave, rekviziti, bodyweight) sa opisom i opcionim videom
- Pretraga i pregled trenera (sortiranje po oceni, paginacija)
- Slanje zahteva treneru i njegova obrada (prihvatanje/odbijanje)
- Kreiranje i pregled treninga za klijenta
- Ocenjivanje treninga, trenera i pojedinačnih vežbi
- Administratorski pregled trenera po prosečnoj oceni

## 3. Nefunkcionalni zahtevi

- Bezbednost: heširane lozinke (bcrypt), JWT sesije, kontrola pristupa rutama
- Responzivan interfejs sa podrškom za svetlu i tamnu temu
- Performanse: paginacija rezultata i indeksi nad bazom
- Validacija svih korisničkih unosa na serverskoj strani
- Modularan i statički tipiziran kod (TypeScript)
- Prenosivost: Node.js + PostgreSQL, konfiguracija u `.env`

## 4. Arhitektura i korišćene tehnologije

| Sloj                         | Tehnologija                     |
| ---------------------------- | ------------------------------- |
| Framework                    | Next.js 16 (App Router)         |
| Programski jezik             | TypeScript                      |
| Baza podataka                | PostgreSQL                      |
| Objektno-relaciono mapiranje | Prisma 7 (`@prisma/adapter-pg`) |
| Autentifikacija              | JWT                             |

Aplikacija koristi arhitekturu serverskih komponenti (React Server Components) i
serverskih akcija (Server Actions) okruženja Next.js, čime se poslovna logika i
pristup bazi podataka izvršavaju isključivo na serverskoj strani.

---

## 5. Uputstvo za instalaciju i pokretanje

### 5.1. Preduslovi

Instalirani:

- [Node.js](https://nodejs.org/) (verzija 20 ili novija)
- [PostgreSQL](https://www.postgresql.org/download/) (+ opciono pgAdmin)
- [Git](https://git-scm.com/)

### 5.2. Kloniranje repozitorijuma

```bash
git clone <URL_REPOZITORIJUMA>
cd tim9-app
```

### 5.3. Instalacija zavisnosti

Sve zavisnosti su navedene u `package.json`. Dovoljno je pokrenuti:

```bash
npm install
```

> Ovo skida sve potrebne pakete i automatski pokreće `prisma generate`
> (zahvaljujući `postinstall` skripti) — nije potrebno ništa dodatno ručno instalirati.

### 5.4. Kreiranje baze podataka

U pgAdmin (ili `psql`) napravi praznu bazu pod imenom **`tim9`**.

### 5.5. Konfiguracija konekcije (`.env`)

Kopiraj `.env.example` u `.env` i upiši svoje podatke (korisnik, lozinka, ime baze):

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:TVOJA_LOZINKA@localhost:5432/tim9?schema=public"
```

> `.env` se **ne** commit-uje na Git (svako ima svoju lozinku). Šablon je u `.env.example`.

### 5.6. Kreiranje šeme i unos početnih podataka

```bash
npm run db:setup
```

Ovo pokrene migracije (kreira sve tabele) **i** ubaci početne podatke preko seed skripte
`prisma/seed.ts` — **10 trenera** (različite ocene), **test trener** `trener@mail.com`, i
**3 klijenta** (`klijent@gmail.com`, `klijent2@gmail.com`, `klijent3@gmail.com`).
Lozinka za sve seed naloge je `trener123`.

> Seed je idempotentan (koristi `upsert`) — može se pokrenuti više puta bez duplikata
> naredbom `npm run db:seed`. Za čist restart baze koristiti `npm run db:reset`, a zatim
> `npm run db:seed`.

### 5.7. Pokretanje aplikacije

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000).

---

## 6. Skripte i komande

| Komanda              | Opis                             |
| -------------------- | -------------------------------- |
| `npm run dev`        | Pokreće development server       |
| `npm run db:setup`   | Migracije + seed (sve odjednom)  |
| `npm run db:migrate` | Primeni Prisma migracije na bazu |
| `npm run db:seed`    | Ubaci početne podatke (seed)     |
| `npm run db:reset`   | Obriši i ponovo napravi bazu     |
| `npx prisma studio`  | Vizuelni pregled baze u browseru |

## 7. Struktura projekta

```
app/
  components/       # Reupotrebljive komponente (Logo, ThemeToggle, forme...)
  lib/              # Poslovna logika: pristup bazi, sesije, serverske akcije
  login/            # Ruta /login — prijava korisnika
  register/         # Ruta /register — registracija korisnika
  trainers/         # Ruta /trainers — pretraga trenera
  profile/          # Ruta /profile — izmena podataka o nalogu
  vezbe/            # Ruta /vezbe — evidencija vežbi trenera
  layout.tsx        # Korenski raspored (layout) aplikacije
  page.tsx          # Početna stranica (prilagođena ulozi korisnika)
prisma/
  schema.prisma     # Šema baze podataka (entiteti i relacije)
  migrations/       # Istorija migracija baze
  seed.ts           # Skripta za unos početnih podataka
public/uploads/     # Otpremljeni video prilozi (van sistema za verzionisanje)
```

## 8. Model podataka

Relacioni model obuhvata sledeće entitete:

- **Client** — nalog klijenta (ime, jedinstvena e-adresa, heširana lozinka).
- **Trainer** — nalog i profil trenera (specijalnost, grad, mesečna cena, ocena).
- **TrainerRequest** — zahtev klijenta upućen treneru, sa statusom
  (`PENDING`, `ACCEPTED`, `REJECTED`) i porukom; povezan relacijama sa entitetima
  Client i Trainer.
- **Exercise** — vežba u evidenciji trenera (naziv, opis, kategorija, opciona
  putanja do video priloga); povezana sa entitetom Trainer.

Video prilozi vežbi čuvaju se u datotečnom sistemu (direktorijum `public/uploads`),
dok se u bazi podataka evidentira isključivo putanja do odgovarajuće datoteke.

## 9. Bezbednosni aspekti

- **Lozinke** se ne čuvaju u izvornom obliku, već kao kriptografski heš (`bcrypt`).
- **Sesije** se realizuju potpisanim JWT tokenom (algoritam HS256) koji se čuva u
  `httpOnly` kolačiću, čime se sprečava pristup tokenu iz klijentskog JavaScript koda.
- **Kontrola pristupa** privatnim rutama i serverskim akcijama sprovodi se
  centralizovanom proverom sesije; neovlašćeni pristup preusmerava korisnika na
  početnu stranicu.
- **Poverljivi podaci** (pristupni podaci baze, tajni ključ za potpisivanje tokena)
  čuvaju se u datoteci `.env`, koja je izuzeta iz sistema za verzionisanje.
