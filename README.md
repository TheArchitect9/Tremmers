# Alpha Work Tracker — Starter & Design System

This repository contains:

- A React + Tailwind starter demonstrating the key screens and components: Login, Function Selection, Machine Selection, Boat Info, Active Session, Admin Panel.

What I created for you
- `tailwind.config.js` with extended font sizes and spacing primitives mapped to the design tokens.
- Minimal Vite + React starter with Tailwind CSS and simple step-based navigation. No backend; session state is transient.

How to run (Windows PowerShell)

```powershell
npm install
npm run dev
```

Notes
- Place your real images into `public/images/` (see README there) using the file names `alpha-logo.png`, `excavator.png`, `shovel-1.png`.
- Fonts: Roboto is loaded in `index.html` via Google Fonts. In production you may self-host for offline use.
- Icons: The example uses `@heroicons/react`. You can alternatively use the Heroicons CDN or SVGs directly.

Next steps I can take
- Hook real authentication and a small API for persisting sessions.
- Implement localStorage persistence for session state across restarts.
- Add unit tests and E2E tests, or wire React Router for deep-linking.

Backend (production-ready, central data)
---------------------------------------
Use a hosted backend for central user accounts, shared sessions, live activity and admin approval across devices.

Quick setup:
1. Create a backend project.
2. In your project, open SQL Editor and run `supabase_schema.sql` (file in this repo) to create tables.
3. In Project Settings → API, copy the project URL and public browser key.
4. In your Vercel (or Netlify) project set environment variables:
	- VITE_SUPABASE_URL = <your supabase url>
	- VITE_SUPABASE_ANON_KEY = <your anon key>
5. Install the backend client locally:

```powershell
npm install @supabase/supabase-js
```

6. Deploy the frontend to Vercel and add the same env vars in the Vercel dashboard.

Notes:
- I added `src/lib/supabaseClient.js` which reads the env vars and exports a backend client instance.
- The project contains `supabase_schema.sql` with the tables `profiles`, `sessions`, and `maintenance`.
- Next I can wire the frontend auth and CRUD calls to the backend (register/login, create session records, maintenance logs).

Tell me which of those you want next or if you'd like tweaks to the visual tokens.

Security note
-------------
Do not expose server-only keys to the browser. The app uses authenticated client access with database policies instead
of a public privileged proxy.
