# Tim 9 — Veb aplikacija za povezivanje klijenata i ličnih trenera

## 1. Uvod

Projekat predstavlja veb aplikaciju čija je namena posredovanje između korisnika
(klijenata) koji traže usluge ličnog treninga i sertifikovanih trenera. Sistem
omogućava pretragu i pregled trenera, slanje i obradu zahteva za saradnju, vođenje
evidencije vežbi i kreiranje treninga, upravljanje opremom klijenta, kao i međusobno
ocenjivanje i komentarisanje trenera i klijenata. Administrator odobrava trenere,
upravlja katalogom opreme i moderira sistem. Aplikacija je realizovana kao full-stack
rešenje zasnovano na okruženju Next.js, uz relacionu bazu podataka PostgreSQL i
objektno-relaciono mapiranje (ORM) putem alata Prisma. Autentifikacija korisnika
implementirana je bezbednosno, korišćenjem heširanja lozinki i potpisanih JWT tokena.

## 2. Funkcionalni zahtevi

### Klijent

- Registracija, prijava i odjava naloga
- Izmena profila (ime, e-adresa, lozinka) i unos telesnih podataka (visina, težina, godine)
- Pretraga i pregled trenera (sortiranje po oceni, filter po gradu, paginacija)
- Pregled svih ocena i komentara pojedinog trenera (iskačući prozor / popup)
- Slanje zahteva treneru uz propratnu poruku
- Pregled svojih trenera i treninga koje su mu dodelili (sa vežbama i uputstvima)
- Ocenjivanje trenera (jedna ocena po treneru), treninga i pojedinačnih vežbi — uz komentar
- Upravljanje opremom: označavanje bazne opreme iz kataloga kao svoje i kreiranje
  sopstvene (custom) opreme
- Uvid u sopstvenu prosečnu ocenu kao klijent

### Trener

- Registracija (novi trener čeka odobrenje administratora pre pristupa sistemu)
- CRUD nad vežbama (sprava / rekvizit / bodyweight) sa opisom i opcionim video prilogom
- Obrada pristiglih zahteva klijenata (prihvatanje / odbijanje), uz uvid u ocenu klijenta
- Pregled podataka klijenta (visina/težina/godine), njegove opreme i ocena — u zasebnom tabu
- Kreiranje, izmena i brisanje treninga (blokovi vežbi sa serijama, ponavljanjima i pauzom)
- Uvid u ocene i komentare klijenta (za ceo trening i za pojedinačne vežbe)
- Ocenjivanje klijenta („kakav je bio u saradnji"), jedna ocena po klijentu — uz komentar
- Postavljanje mesečne cene i pregled sopstvene prosečne ocene

### Administrator

- Odobravanje trenera koji čekaju odobrenje (status `PENDING`)
- Banovanje i odbanovanje trenera
- Pregled aktivnih trenera sortiranih po prosečnoj oceni
- Upravljanje katalogom bazne opreme (dodavanje, izmena, brisanje)

## 3. Nefunkcionalni zahtevi

- Bezbednost: heširane lozinke (bcrypt), JWT sesije, kontrola pristupa rutama po ulozi
- Slojevita arhitektura (MVVM + Repository) sa jasno razdvojenim odgovornostima
- Prosečne ocene se preračunavaju atomično (u transakciji) pri svakoj novoj oceni
- Responzivan interfejs sa podrškom za svetlu i tamnu temu
- Prelamanje dugačkog teksta bez probijanja kontejnera (robusni UI)
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

Interno je kod organizovan po obrascu **MVVM + Repository**:

- **Model** (`app/models/`) — domenske klase entiteta (atributi i metode).
- **Repository** (`app/repositories/`) — jedino mesto koje komunicira sa bazom (Prisma).
- **ViewModel** (`app/viewmodels/`) — priprema podatke prilagođene svakom ekranu.
- **View** (`app/(views)/`) — stranice (rute) koje prikazuju podatke iz view-modela.

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
`prisma/seed.ts`:

- **13 trenera** — 11 aktivnih (različite ocene), 1 koji čeka odobrenje (`pending@gmail.com`),
  1 banovan (`banned@gmail.com`), plus test trener `trener@gmail.com` (ima vežbe, zahteve,
  treninge, ocene);
- **3 klijenta** (`klijent@gmail.com`, `klijent2@gmail.com`, `klijent3@gmail.com`) sa
  telesnim podacima; prvi klijent ima trenere, treninge, ocene i opremu;
- **1 administrator** (`admin@gmail.com`);
- **katalog bazne opreme**, kao i demonstracioni zahtevi (PRIHVAĆEN / NA ČEKANJU / ODBIJEN),
  treninzi sa ocenama i komentarima, te ocene trenera i klijenata.

Lozinka za trenere i klijente je `trener123`, a za administratora `admin123`.

> Seed je idempotentan — relacioni podaci se kreiraju samo na praznoj bazi, pa se može
> pokrenuti više puta bez duplikata (`npm run db:seed`). Za potpun čist restart baze
> (brisanje + migracije + seed u jednom koraku) koristiti `npm run db:reset`.

### 5.7. Pokretanje aplikacije

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000).

---

## 6. Skripte i komande

| Komanda              | Opis                                          |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Pokreće development server                    |
| `npm run db:setup`   | Migracije + seed (sve odjednom)               |
| `npm run db:migrate` | Primeni Prisma migracije na bazu              |
| `npm run db:seed`    | Ubaci početne podatke (seed)                  |
| `npm run db:reset`   | Obriši, migriraj i napuni bazu (reset + seed) |
| `npx prisma studio`  | Vizuelni pregled baze u browseru              |

## 7. Struktura projekta

```
app/
  (views)/          # View sloj — sve rute/stranice (route group; ne utiče na URL)
  models/           # Domenske klase entiteta (atributi i metode)
  repositories/     # Pristup bazi (Prisma) — jedino mesto koje priča sa bazom
  viewmodels/       # Priprema podataka po ekranu (poziva repozitorijume)
  components/       # Reupotrebljive UI komponente (forme, modali, dugmad...)
  lib/              # Serverske akcije, sesije, upload, Prisma klijent
  generated/prisma/ # Generisani Prisma klijent
  layout.tsx        # Korenski raspored (layout) aplikacije
  globals.css       # Globalni stilovi
prisma/
  schema.prisma     # Šema baze podataka (entiteti i relacije)
  migrations/       # Istorija migracija baze
  seed.ts           # Skripta za unos početnih podataka
public/uploads/     # Otpremljeni video prilozi (van sistema za verzionisanje)
```

## 8. Model podataka

Relacioni model obuhvata sledeće entitete:

- **Client** — nalog klijenta (ime, jedinstvena e-adresa, heširana lozinka, visina,
  težina, godine, prosečna ocena).
- **Trainer** — nalog i profil trenera (specijalnost, grad, mesečna cena, prosečna ocena,
  status: `PENDING` / `ACTIVE` / `BANNED`).
- **Admin** — administratorski nalog.
- **TrainerRequest** — zahtev klijenta upućen treneru, sa statusom
  (`PENDING`, `ACCEPTED`, `REJECTED`) i porukom; povezan sa entitetima Client i Trainer.
- **Exercise** — vežba u evidenciji trenera (naziv, opis, kategorija, opciona putanja do
  video priloga); povezana sa entitetom Trainer.
- **Training** — trening koji trener dodeljuje klijentu (naziv, datum, ocena i komentar
  klijenta za ceo trening).
- **TrainingBlock** — jedan blok/vežba unutar treninga (serije, ponavljanja, pauza,
  napomena, ocena klijenta za tu vežbu); spona između entiteta Training i Exercise.
- **Equipment** — oprema (bazna iz kataloga koju kreira admin ili custom koju pravi klijent).
- **ClientEquipment** — spona „klijent poseduje opremu" (veza više-na-više).
- **TrainerReview** — ocena i komentar koje klijent daje treneru (jedna po paru
  klijent–trener); pokreće preračun prosečne ocene trenera.
- **ClientReview** — ocena i komentar koje trener daje klijentu (jedna po paru
  trener–klijent); pokreće preračun prosečne ocene klijenta.

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
