**Beveiliging & API-keys**

- Bewaar geen keys in de repository. Voeg secrets toe via Vercel/GitHub Secrets/Netlify env vars.
- `VITE_SUPABASE_ANON_KEY` mag door de frontend gebruikt worden; `service_role` mag NOOIT in clientcode of git staan.
- Als je vermoedt dat een key gelekt is: roteer direct in Supabase (Project → Settings → API → Keys).

Aanbevolen checks
- Controleer dat `.env.local` in `.gitignore` staat (staat al in deze repo).
- Controleer git-history op mogelijke gelekte keys. Voorbeeldcommando's:
  - `git ls-files --others --exclude-standard`  # toont ongecommitete bestanden
  - `git grep -I -n "eyJhbGciOiJI"`           # zoekt JWT-achtige tokens in repo

Supabase-specifiek
- Zorg dat je Row Level Security (RLS) policies hebt ingesteld.
  - Voor `profiles`: alleen de gebruiker zelf mag zijn profiel selecteren/update.
  - Voor `work_sessions`: laat geauthenticeerde gebruikers `INSERT` doen; `SELECT` enkel voor admins.

Migratie
- `migrations/001-set-approved.sql` bevat een UPDATE-statement dat je kunt plakken in Supabase SQL editor om bestaande profielen goed te keuren.
