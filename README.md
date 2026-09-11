# Job Command

Field-operations command center for dispatching work orders, assigning technicians, and watching jobs move across a live board.

## Architecture

| Module | Responsibility |
| --- | --- |
| Auth | Email/password sessions with HTTP-only signed cookies and role checks |
| Team | Admin, dispatcher, technician, and viewer operators |
| Customers | Sites/accounts that receive work |
| Jobs | Work orders with status, priority, assignee, schedule, notes, and activity |
| Command board | Live dashboard with status lanes and KPI cards |
| API | REST handlers under `/api` plus SSE at `/api/jobs/stream` |

### User roles

- **Admin** — full access, including team management and job deletion
- **Dispatcher** — create/assign jobs and manage customers
- **Technician** — see and update assigned jobs, add notes
- **Viewer** — read-only board and lists

### Data model

- `users` — operators (`id`, `email`, `name`, `password_hash`, `role`, `active`)
- `customers` — dispatch targets
- `jobs` — work orders (`job_number`, `status`, `priority`, `customer_id`, `assigned_to_user_id`)
- `job_notes` — field notes
- `job_events` — audit trail (`created`, `updated`, `status_changed`, `assigned`, `note_added`)

Job status path: `queued` → `assigned` → `in_progress` → `blocked` / `completed`. Invalid transitions are rejected.

### API

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/signup` | Public, first user only |
| POST | `/api/auth/logout` | Signed in |
| GET | `/api/auth/me` | Signed in |
| GET/POST | `/api/jobs` | Role-scoped |
| GET/PATCH/DELETE | `/api/jobs/:id` | Role-scoped |
| POST | `/api/jobs/:id/notes` | Role-scoped |
| GET | `/api/jobs/stream` | Signed in SSE |
| GET/POST | `/api/customers` | Signed in / dispatcher+ |
| GET/PATCH/DELETE | `/api/customers/:id` | Signed in / dispatcher+ |
| GET/POST | `/api/team` | Signed in / admin write |
| PATCH | `/api/team/:id` | Admin |
| GET | `/api/dashboard` | Signed in |
| GET | `/api/health` | Public |

## Stack

- Next.js App Router on Vercel
- Drizzle ORM
- Neon Postgres in production (`DATABASE_URL`)
- PGlite file DB locally when `DATABASE_URL` is unset
- In-memory PGlite on Vercel when `DATABASE_URL` is unset (demo only; data is per-isolate)
- shadcn/ui + Tailwind CSS

## Local setup

```bash
npm install
cp .env.example .env.local
# set AUTH_SECRET (optional locally; required on Vercel)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with:

- `admin@jobcommand.local`
- `dispatch@jobcommand.local`
- `tech@jobcommand.local`
- `viewer@jobcommand.local`
- Password: `Command#2026`

Demo users are seeded automatically on the local PGlite database.

## Production (Vercel + Neon)

1. Link the GitHub repo to a Vercel project.
2. Install Neon: `vercel integration add neon` (or the Vercel dashboard Marketplace).
3. Set `AUTH_SECRET` for Production, Preview, and Development.
4. Optionally set `SEED_DEMO=true` if you want the demo operators on Neon.
5. Deploy. The first signup becomes admin when the user table is empty.
6. Attach a custom domain in Vercel → Project → Settings → Domains.

```bash
npm test
npm run lint
npm run build
```
