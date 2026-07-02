# 💍 Gowtham's Wedding — Family Hub

A fun, shared web app for the whole family to plan the wedding together:
timeline, catering menu, an ideas board you can vote on, a shared to-do /
shopping list, and a photo gallery. **Anyone with the link can view; family
sign in (magic link, no password) to add & edit.** Everything updates live.

- **Frontend:** React + Vite + Tailwind — hosted free on **GitHub Pages**
- **Data + auth + realtime:** **Supabase** (Postgres)
- **Photos/files:** **Cloudflare R2** (uploaded securely via a Supabase Edge Function)

---

## 🚀 Quick start (local)

```bash
npm install
cp .env.example .env      # then fill in your Supabase URL + anon key
npm run dev
```

Open the printed URL. Until `.env` is set, the app shows a friendly "connect
Supabase" banner.

---

## 1. Set up Supabase (data + login)

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste all of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   Creates the tables + security rules (public read, login to edit) + realtime.
3. **Project Settings → API** → copy the **Project URL** and **anon public key**
   into your `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
4. **Authentication → Providers → Email** → make sure it's enabled (it is by
   default). Magic links will be emailed to family members.
   - Under **Authentication → URL Configuration**, add your GitHub Pages URL
     (e.g. `https://<you>.github.io/gowtham_marriage/`) to **Redirect URLs**.

> 🔒 Want to lock signups to only your family? In **Authentication → Providers →
> Email**, turn off open sign-ups, or add allowed domains. Anyone not signed in
> can still *view* everything.

---

## 2. Set up Cloudflare R2 (photo storage)

1. In the Cloudflare dashboard → **R2** → **Create bucket** (e.g. `gowtham-wedding`).
2. Enable public access for the bucket: **Settings → Public access** — either
   the `r2.dev` dev URL, or connect a **custom domain** (recommended, e.g.
   `media.your-domain.com`). Copy that public base URL.
3. **R2 → Manage API Tokens → Create API token** with **Object Read & Write**.
   Save the **Access Key ID** and **Secret Access Key**.
4. Find your **Account ID** (R2 overview page).

### Deploy the upload function (Supabase Edge Function)

Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then:

```bash
supabase login
supabase link --project-ref <your-project-ref>

# Store R2 credentials as server-side secrets (NEVER in the frontend):
supabase secrets set \
  R2_ACCOUNT_ID=xxxx \
  R2_ACCESS_KEY_ID=xxxx \
  R2_SECRET_ACCESS_KEY=xxxx \
  R2_BUCKET=gowtham-wedding \
  R2_PUBLIC_URL=https://media.your-domain.com

supabase functions deploy r2-upload-url
```

Add the same public URL as an allowed **CORS origin** on the R2 bucket so the
browser can PUT to it: **R2 → your bucket → Settings → CORS policy**:

```json
[
  {
    "AllowedOrigins": ["https://<you>.github.io", "http://localhost:5173"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

That's it — photo uploads now work.

---

## 3. Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Repo → **Settings → Secrets and variables → Actions** → add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Repo → **Settings → Pages** → **Source: GitHub Actions**.
4. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and
   publishes automatically. Your site: `https://<you>.github.io/gowtham_marriage/`.

> Prefer one-command deploy from your machine instead? `npm run deploy` (uses
> `gh-pages`). But the Actions workflow is easier for keeping secrets out of the
> build.

---

## ✏️ Customise

- **Couple names, date, venue, hashtag:** edit [`src/lib/config.js`](src/lib/config.js).
  The homepage countdown reads from here.
- **Colors & fonts:** [`tailwind.config.js`](tailwind.config.js) and
  [`src/index.css`](src/index.css).
- **Photo albums / menu courses / idea categories:** small arrays at the top of
  the relevant page in `src/pages/`.

## 🗂️ Project structure

```
src/
  lib/         supabase client, upload helper, config, data hook
  contexts/    auth (magic-link login)
  components/  layout, nav, login modal, confetti, shared UI
  pages/       Dashboard, Timeline, Catering, Suggestions, Tasks, Gallery
supabase/
  schema.sql              run once in the SQL editor
  functions/r2-upload-url  the presigned-URL edge function
```

Made with 💛 for the family.
