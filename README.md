# Job Command

All-in-one trade business command desk: AI voice receptionist, live fleet GPS, job estimating, receipt capture, and crew field portals.

**Stack:** React 19 · Vite · Tailwind CSS · TypeScript · Supabase Realtime · Vapi Web SDK · Leaflet

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The desk boots in **demo mode** with a Tampa Bay HVAC/plumbing fleet. Company profile, jobs, expenses, and invite links persist in this browser.

## Optional cloud wiring

1. Create a Supabase project, run `supabase/schema.sql`, copy the URL and anon key into `.env.local`.
2. Create a Vapi assistant, then paste the public key and assistant ID in **Settings** (or `VITE_VAPI_*`).
3. Open a tech **Invite link** / field portal (`/crew/:token`) on a phone and tap **Share GPS**.

## Scripts

- `npm run dev` — command desk at http://localhost:5173
- `npm run build` — production bundle
- `npm run preview` — serve the bundle
