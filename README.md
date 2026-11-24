# RepairTrack

Multi-platform repair ticket and customer tracking system for device repair shops (Final Year Project).

| Folder | What it is | Tech |
| --- | --- | --- |
| `backend/` | REST API | Node.js, Express, PostgreSQL, Prisma 7 |
| `web/` | Staff web app (later also guest tracking, customer and platform-owner pages) | React, Vite, Tailwind CSS |
| `mobile/` | Android / iOS app for staff (later also customers) | React Native, Expo |

## Progress

- [x] **10%: Foundation** (repo, database schema, seed data, auth API, web login, mobile login)
- [ ] 20%: Shop registration, roles, staff management
- [ ] 30%: Customers and ticket intake, QR codes
- [ ] 40%: Repair workflow, assignment, guest tracking API
- [ ] 50%: Mobile ticket screens, guest tracking page, demo

## First-time setup on Windows

You need: **Node.js 22 LTS**, **PostgreSQL 16 or 17** (with pgAdmin), **Git**, and **Expo Go** on your phone.

### 1. Database

Open **pgAdmin** → log in → right-click **Databases** → **Create → Database** → name: `repair_tracking` → Save.

### 2. Backend (API)

Open a Command Prompt in the project folder:

```bat
cd backend
copy .env.example .env
notepad .env
```

In Notepad, set `DB_PASSWORD=` to your PostgreSQL password, save and close. Then:

```bat
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

- `npm install` also runs `prisma generate` (creates the Prisma Client).
- `prisma migrate dev --name init` creates `prisma/migrations/..._init/migration.sql` and builds all tables. Run it only the **first time**; later schema changes get their own name, e.g. `--name add_inventory`.
- The first Prisma command downloads Prisma's engine, so you need internet for it.

Open http://localhost:4000/api/v1/health. You should see `"database":"up"`.
Leave this window open while you work.

### 3. Web app

Open a **second** Command Prompt in the project folder:

```bat
cd web
copy .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 and sign in with a demo account below.

### 4. Mobile app

Open a **third** Command Prompt in the project folder:

```bat
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the **Camera app** (iPhone). Your phone must be on the **same Wi-Fi** as the PC.
The app finds the API automatically using your PC's IP address.

If the phone cannot reach the API, allow Node.js through **Windows Defender Firewall** (Private networks) when Windows asks, or run once as admin:

```bat
netsh advfirewall firewall add rule name="RepairTrack API" dir=in action=allow protocol=TCP localport=4000
```

## Demo accounts

All passwords: `Password@123`

| Email | Role | Shop |
| --- | --- | --- |
| admin@citymobile.pk | Shop admin | City Mobile Repair |
| desk@citymobile.pk | Front desk | City Mobile Repair |
| tech@citymobile.pk | Technician | City Mobile Repair |
| admin@fixitlab.pk | Shop admin | FixIt Lab |
| owner@repairtrack.app | Platform owner | (none) |

## Useful commands (in `backend/`)

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API with auto-restart |
| `npm run db:migrate` | Apply schema changes (`prisma migrate dev`) |
| `npm run db:seed` | Reset demo data |
| `npm run db:reset` | Drop everything, re-run all migrations and the seed |
| `npm run db:studio` | Open Prisma Studio to browse the data in your browser |

## API so far

Base URL: `http://localhost:4000/api/v1`. See `docs/API.md`.

## Push to GitHub (once Git is installed)

```bat
git init
git add .
git commit -m "Milestone 1: foundation and auth"
git branch -M main
git remote add origin https://github.com/125Anas-rgb/Repair-Management-system.git
git push -u origin main
```
