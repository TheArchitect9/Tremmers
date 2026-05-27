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

Supabase (production-ready, central data)
---------------------------------------
If you want central user accounts, shared sessions and admin approval across devices, use Supabase.

Quick setup:
1. Create a free Supabase account and a new project at https://app.supabase.com.
2. In your project, open SQL Editor and run `supabase_schema.sql` (file in this repo) to create tables.
3. In Project Settings → API, copy the `URL` and `anon` public key.
4. In your Vercel (or Netlify) project set environment variables:
	- VITE_SUPABASE_URL = <your supabase url>
	- VITE_SUPABASE_ANON_KEY = <your anon key>
5. Install the Supabase client locally:

```powershell
npm install @supabase/supabase-js
```

6. Deploy the frontend to Vercel and add the same env vars in the Vercel dashboard.

Notes:
- I added `src/lib/supabaseClient.js` which reads the env vars and exports a `supabase` client instance.
- The project contains `supabase_schema.sql` with the tables `profiles`, `sessions`, and `maintenance`.
- Next I can wire the frontend auth and CRUD calls to Supabase (register/login, create session records, maintenance logs).

Tell me which of those you want next or if you'd like tweaks to the visual tokens.

Protecting server-side API keys
------------------------------
The repository includes a small Vercel serverless proxy at `api/supabase-proxy.js` which lets you keep the Supabase
`service_role` key on the server (never commit keys). Use the server proxy for any operation that requires privileged
access. Quick notes:

- **Server env vars to set (Vercel)**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), and the existing
	client vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **How to call the proxy from the client**: send requests to `/api/supabase-proxy?p=<rest-path>`.
	Example (JS):

	```javascript
	// POST to insert into a table via the proxy
	await fetch('/api/supabase-proxy?p=rest/v1/sessions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ user_id: '...', started_at: new Date().toISOString() })
	})
	```

- **Local development**: create a `.env` with the variables from `.env.example` (do not commit `.env`).

If you want, I can: (a) rewrite specific client calls to use the proxy instead of the public anon key, or (b) add
convenience helper functions for the proxy.
