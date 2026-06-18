# Fitness Tracker

A single-page React fitness/training tracker — PPL split with kendo/rehab/bike
add-ons, readiness check, strength-trend chart, rehab log, macros, and a daily
Qur'an verse. All data is stored in the browser via `localStorage`.

## Run it locally

You need [Node.js](https://nodejs.org) (v18 or newer). Then:

```bash
npm install      # one time — downloads React + Vite
npm run dev      # starts a local server, usually http://localhost:5173
```

Open the URL it prints. Edits to `src/App.jsx` hot-reload instantly.

## Put it on GitHub

```bash
git init
git add .
git commit -m "Initial commit: fitness tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fitness-tracker.git
git push -u origin main
```

## Deploy (pick one)

### Vercel (easiest)
1. Go to vercel.com, "Add New Project", import your GitHub repo.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
3. Deploy. Done — you get a live URL, and every `git push` redeploys.
   No `base` config needed.

### GitHub Pages
1. In `vite.config.js`, uncomment the `base` line and set it to `"/REPO-NAME/"`.
2. `npm run build` → produces a `dist/` folder.
3. Either use the `gh-pages` package or GitHub Actions to publish `dist/`.

## How data works (important)

- Everything you log lives in **`localStorage` on the device/browser you used.**
  Clear your browser data and it's gone. It does **not** sync between your phone
  and laptop.
- To get real cross-device sync later, replace the three functions at the top of
  `src/App.jsx` — `sg` (get), `ss` (set), `slist` (list keys) — with calls to a
  backend like Supabase. The rest of the app is written against just those three,
  so nothing else has to change.

## Notes

- The Qur'an verse bank is a hardcoded array (`QURAN`) of 30 verses that rotates
  by day-of-year. 9 were verified against Quran.com; 6 are standard Sahih
  International wording worth spot-checking. To pull verified text live instead,
  swap the array for a fetch to the Quran.com API.
- The rehab exercises are generic flat-foot/MTSS picks — replace them with your
  PT's actual prescription (edit the `REHAB` array near the top of `App.jsx`).
- Macros are set in the `TGT` constant. Adjust after tracking your weight 2–3 weeks.
