# Paula & Oriol — September 19, 2026

Wedding website for Paula and Oriol's celebration at Mas Corbella, Alcover (Tarragona).

## Features

- **Multilingual** — Catalan, Spanish and English (`/ca`, `/es`, `/en`). Defaults to `/es`.
- **RSVP form** — Validated form with honeypot spam protection, stored in Supabase. Sends a notification email to the organizers and a confirmation email to the guest in their language.
- **Guest dashboard** — Password-protected route at `/lista` with RSVP list, stats and session management.
- **Informational sections** — Event info, day timeline, photo gallery, FAQ, venue with map, playlist and countdown.

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS** + Framer Motion
- **Supabase** — Database for RSVPs
- **Resend** — Transactional emails
- **Netlify** — Hosting and deployment

## Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=           # e.g. hello@paulaoriol.com
NOTIFICATION_EMAILS=         # comma-separated emails for organizer notifications

# Dashboard
DASHBOARD_PASSWORD=          # password to access /lista
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects automatically to `/es`.

## Deployment

Configured for Netlify with `@netlify/plugin-nextjs`. Every push to `main` deploys automatically.
