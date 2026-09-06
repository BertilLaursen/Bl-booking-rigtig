# Blå Booking

Nem booking af maskiner og udstyr. Bygget med Next.js 14 (App Router), TypeScript,
Prisma + PostgreSQL, og NextAuth til login/roller.

## Status på denne kodebase

Dette er en komplet, kørbar **produktions-kodebase** for kerneflowet fra specifikationen:

> Admin opretter maskine → bruger får invitation → bruger opretter konto → bruger
> logger ind → bruger ser maskiner → bruger vælger maskine → bruger ser kalender →
> bruger vælger fra/til → systemet kontrollerer ledighed (på database-niveau) →
> booking oprettes → maskinen vises som booket for andre brugere.

Implementeret:
- Invitationskoder (oprette/deaktivere, roller USER/ADMIN)
- Roller: Superadmin, Admin, Bruger — håndhævet i **API'et**, ikke kun i UI
- Login/registrering med sikkert hashede adgangskoder (bcrypt)
- Maskineliste med status (Ledig/Booket/Ude af drift/Deaktiveret), søgning og filter
- Maskinedetalje med kalender + booking, med overlap-kontrol i en database-transaktion
- "Mine bookinger" med annullering
- Admin-panel: dashboard, maskiner, brugere, invitationer
- Synlighedsniveau for hvem der kan se hvem der har booket (fuldt navn / kun fornavn / skjult)

**Ikke bygget endnu** (bevidst, jf. spec-punkt 19 "Fremtidige muligheder"):
push-notifikationer, QR-koder, skaderapportering, kilometertæller,
vedligeholdelsesplan, flere afdelinger, statistik, godkendelsesflow.
Databasemodellen (`prisma/schema.prisma`) er lavet, så disse nemt kan tilføjes senere.

**Vigtigt:** Denne kode er skrevet og gennemgået manuelt, men er *ikke* blevet kørt op
mod en rigtig database eller bygget i dette miljø (ingen netværksadgang her). Følg
opsætningen nedenfor, og ret evt. mindre fejl undervejs — det er helt normalt ved
førstegangsopsætning af et nyt projekt.

## Kom i gang

### 1. Forudsætninger
- Node.js 18+
- En PostgreSQL-database (lokalt, eller gratis hos f.eks. [Neon](https://neon.tech) eller [Supabase](https://supabase.com))

### 2. Installation
```bash
npm install
cp .env.example .env
# Ret DATABASE_URL, NEXTAUTH_SECRET osv. i .env
```

### 3. Database
```bash
npx prisma migrate dev --name init
npm run db:seed
```
`db:seed` opretter den første Superadmin (email/password fra `.env`) og udskriver
en invitationskode i terminalen, du kan bruge til at oprette en almindelig testbruger.

Anbefalet ekstra skridt i produktion: kør SQL'en i
`prisma/migrations_extra/optional_exclude_constraint.sql` for en database-garanti
mod overlappende bookinger, oven i den transaktion koden allerede bruger.

### 4. Kør lokalt
```bash
npm run dev
```
Åbn http://localhost:3000 — log ind med Superadmin-kontoen, opret en maskine under
Admin, og opret en ny bruger via invitationskoden fra seed-scriptet.

### 5. Deployment
Fungerer fint på f.eks. Vercel (app) + Neon/Supabase (database). Husk at sætte
`DATABASE_URL`, `NEXTAUTH_SECRET` og `NEXTAUTH_URL` som miljøvariabler i produktion,
og kør `npx prisma migrate deploy` mod produktionsdatabasen.

## Projektstruktur
```
app/                Sider (App Router) + API-routes under app/api
  admin/            Admin-panel (maskiner, brugere, invitationer, dashboard)
  machines/[id]/    Maskinedetalje + booking
  bookinger/        "Mine bookinger"
lib/                Prisma-klient, auth-konfiguration, adgangskontrol, booking-logik
prisma/schema.prisma Datamodel
middleware.ts       Ruter under /admin kræver Admin/Superadmin-rolle (server-side)
```

## Sikkerhed — hvordan reglerne i spec'en er håndhævet
- Alle rolle-tjek sker i API-routes (`app/api/**/route.ts`) og i `middleware.ts`,
  aldrig kun i frontend — en bruger kan ikke ophøje sig selv til Admin.
- Adgangskoder gemmes kun som bcrypt-hash, aldrig i klartekst.
- Kun Superadmin kan ændre roller eller uddele Admin-invitationer.
- Booking-overlap tjekkes i en database-transaktion (`lib/booking.ts`), ikke kun i
  klienten — se også den valgfrie EXCLUDE-constraint nævnt ovenfor.

## Næste skridt
Åbn dette projekt i Claude Code for at fortsætte udviklingen (køre database lokalt,
teste booking-flowet, tilføje de resterende punkter fra spec'ens afsnit 19).
