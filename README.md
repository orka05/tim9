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

## 2. Funkcionalne karakteristike

**Zajedničke funkcionalnosti**

- Registracija i prijava korisnika (uloga klijent ili trener)
- Upravljanje sopstvenim profilom (izmena ličnih podataka)
- Podrška za svetlu i tamnu temu korisničkog interfejsa

**Funkcionalnosti klijenta**

- Pregled i pretraga trenera prema imenu, specijalnosti i gradu
- Sortiranje trenera prema oceni i paginacija rezultata
- Slanje zahteva za saradnju sa propratnom porukom

**Funkcionalnosti trenera**

- Pregled i obrada (prihvatanje/odbijanje) pristiglih zahteva klijenata
- Vođenje evidencije vežbi (naziv, opis, kategorija) sa opcionim video prilogom
- Klasifikacija vežbi u kategorije: sprava, rekvizit i telesna težina (bodyweight)

## 3. Arhitektura i korišćene tehnologije

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

## 4. Uputstvo za instalaciju i pokretanje

### 4.1. Preduslovi

Instalirani:

- [Node.js](https://nodejs.org/) (verzija 20 ili novija)
- [PostgreSQL](https://www.postgresql.org/download/) (+ opciono pgAdmin)
- [Git](https://git-scm.com/)

### 4.2. Kloniranje repozitorijuma

```bash
git clone <URL_REPOZITORIJUMA>
cd tim9-app
```

### 4.3. Instalacija zavisnosti

Sve zavisnosti su navedene u `package.json`. Dovoljno je pokrenuti:

```bash
npm install
```

> Ovo skida sve potrebne pakete i automatski pokreće `prisma generate`
> (zahvaljujući `postinstall` skripti) — nije potrebno ništa dodatno ručno instalirati.

### 4.4. Kreiranje baze podataka

U pgAdmin (ili `psql`) napravi praznu bazu pod imenom **`tim9`**.

### 4.5. Konfiguracija konekcije (`.env`)

Kopiraj `.env.example` u `.env` i upiši svoje podatke (korisnik, lozinka, ime baze):

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:TVOJA_LOZINKA@localhost:5432/tim9?schema=public"
```

> `.env` se **ne** commit-uje na Git (svako ima svoju lozinku). Šablon je u `.env.example`.

### 4.6. Kreiranje šeme i unos početnih podataka

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

### 4.7. Pokretanje aplikacije

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000).

---

## 5. Skripte i komande

| Komanda              | Opis                             |
| -------------------- | -------------------------------- |
| `npm run dev`        | Pokreće development server       |
| `npm run db:setup`   | Migracije + seed (sve odjednom)  |
| `npm run db:migrate` | Primeni Prisma migracije na bazu |
| `npm run db:seed`    | Ubaci početne podatke (seed)     |
| `npm run db:reset`   | Obriši i ponovo napravi bazu     |
| `npx prisma studio`  | Vizuelni pregled baze u browseru |

## 6. Struktura projekta

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

## 7. Model podataka

Relacioni model obuhvata sledeće entitete:

- **Client** — nalog klijenta (ime, jedinstvena e-adresa, heširana lozinka).
- **Trainer** — nalog i profil trenera (specijalnost, grad, cena po treningu, ocena).
- **TrainerRequest** — zahtev klijenta upućen treneru, sa statusom
  (`PENDING`, `ACCEPTED`, `REJECTED`) i porukom; povezan relacijama sa entitetima
  Client i Trainer.
- **Exercise** — vežba u evidenciji trenera (naziv, opis, kategorija, opciona
  putanja do video priloga); povezana sa entitetom Trainer.

Video prilozi vežbi čuvaju se u datotečnom sistemu (direktorijum `public/uploads`),
dok se u bazi podataka evidentira isključivo putanja do odgovarajuće datoteke.

## 8. Bezbednosni aspekti

- **Lozinke** se ne čuvaju u izvornom obliku, već kao kriptografski heš (`bcrypt`).
- **Sesije** se realizuju potpisanim JWT tokenom (algoritam HS256) koji se čuva u
  `httpOnly` kolačiću, čime se sprečava pristup tokenu iz klijentskog JavaScript koda.
- **Kontrola pristupa** privatnim rutama i serverskim akcijama sprovodi se
  centralizovanom proverom sesije; neovlašćeni pristup preusmerava korisnika na
  početnu stranicu.
- **Poverljivi podaci** (pristupni podaci baze, tajni ključ za potpisivanje tokena)
  čuvaju se u datoteci `.env`, koja je izuzeta iz sistema za verzionisanje.
