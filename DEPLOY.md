# Deploy guide

This deploys Quadratic Vote to **Vercel** (hosting) + **Neon** (Postgres).
Both have free tiers that cover dogfooding fine. ~45 min wall-clock.

---

## Prereqs (you create these accounts)

1. **Neon** — https://neon.tech. Free tier. Sign up.
2. **Vercel** — https://vercel.com. Free Hobby tier. Sign up.
3. **GitHub** — push the repo so Vercel can read it.

---

## Step 1 — Provision the database (Neon)

1. In Neon, create a project. Pick a region near you (Frankfurt / Paris for EU).
2. From the Neon dashboard, copy the **pooled** connection string. It looks
   like:
   ```
   postgresql://USER:PASSWORD@ep-xxxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   The `-pooler` in the hostname is important — Neon's pooled endpoint
   handles serverless connection churn. Don't use the direct (non-pooled)
   URL for the app's runtime.
3. Save this somewhere temporary. You'll paste it in two places.

## Step 2 — Run migrations against Neon

From your terminal in the repo root:

```bash
DATABASE_URL='paste-your-neon-pooled-url-here' npx drizzle-kit migrate
```

You should see `[✓] migrations applied successfully!`. Verify with `psql` or
the Neon SQL Editor — you should see 5 tables: `polls`, `options`,
`voter_tokens`, `ballots`, `votes`.

## Step 3 — Push the repo to GitHub

If you haven't already:

```bash
# Create a new repo on github.com first (private or public — your call).
# Then locally:
git remote add origin git@github.com:YOUR_USERNAME/quadratic-vote-app.git
git push -u origin main
```

If the repo was initialized but never pushed, you may need to commit current
work first:

```bash
git add .
git commit -m "Production-ready: tokenized polls, live results, /explore, /my, brand"
git push -u origin main
```

## Step 4 — Deploy on Vercel

1. Vercel dashboard → **Add New… → Project**.
2. Pick the GitHub repo you just pushed.
3. Vercel auto-detects Next.js. Don't change build settings.
4. Before clicking Deploy, expand **Environment Variables** and add:

   | Name | Value | Notes |
   |---|---|---|
   | `DATABASE_URL` | your Neon pooled URL | Same as Step 2 |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` | The URL Vercel will give you. If unsure, leave blank — you can re-set after first deploy. |

5. Click **Deploy**. Wait ~90s.

## Step 5 — Verify

Open the deployed URL and walk through the smoke checks:

- `/` — landing loads, gradient hero renders, interactive cost-curve demo works.
- `/create` — create a poll (open mode, public, ~3 options).
- Confirm dialog → progress overlay → lands on `/poll/[id]/admin/[token]?created=1`.
- Hit the voter link from a second browser / incognito window — vote, submit.
- `/poll/[id]/results` — live badge ticks, vote count goes up.
- `/explore` — your public poll appears.
- `/my` — your test poll is saved locally.
- **Critical:** view the page source on `/` and find the `og:image` URL —
  something like `https://your-app.vercel.app/api/og/site`. Paste that into
  the browser address bar. **A gradient social card should render.** If it
  doesn't, the OG image generation is broken in prod and we need to
  diagnose — let me know.

## Step 6 — (optional) Update `NEXT_PUBLIC_SITE_URL`

If you skipped or guessed wrong on `NEXT_PUBLIC_SITE_URL`:

1. Vercel → Project → Settings → Environment Variables.
2. Edit `NEXT_PUBLIC_SITE_URL` to match the deployed URL (or your custom domain if you bought one).
3. Redeploy from the Vercel dashboard (Deployments → latest → ⋯ → Redeploy).

## Step 7 — (optional) Custom domain

Vercel → Project → Settings → Domains → Add. Vercel walks you through DNS
records. Update `NEXT_PUBLIC_SITE_URL` after the domain is live and redeploy.

---

## Troubleshooting

- **Build fails on Vercel with "DATABASE_URL undefined"** — the build itself
  doesn't query the DB (no static generation hits it), but env vars must
  exist or the metadata helper throws. Make sure `DATABASE_URL` is set in
  the Vercel env vars BEFORE the first deploy.
- **OG images return 500** — check the function logs (Vercel → Logs). If
  the route times out, the Edge runtime may have a region issue.
- **Voter cookie not sticking** — confirm the deployed URL is HTTPS (Vercel
  default is). The cookie is set with `secure: true` in production.
- **Connection limit errors** — make sure you used the **pooled** Neon URL
  (with `-pooler`). The direct endpoint will throttle under load.

---

## What to do after it's live

You already have an idea for the first poll. Don't add features. Don't
restyle. Don't ship analytics. Just:

1. Create your real poll on the live app.
2. Send the link in Slack to your team.
3. Watch what happens.
4. Talk to 2–3 voters afterward — what was confusing? What worked?

That conversation is the input for what to build next.
