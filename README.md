# Picture of the Day

A React viewer for NASA’s Astronomy Picture of the Day. It opens on **Today** (America/New_York), then lets you step a Day, show a **Range** (default 6 days, max 30), or draw a **Surprise**.

Figma mockup: [APOD Picture of the Day](https://www.figma.com/design/zYLIVXZs3GNC888OHs6Jog/APOD-Picture-of-the-Day?node-id=0-1&t=OAW3a7Mh8cpgCexR-1) (password: `alan-uf`)

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `VITE_NASA_API_KEY` to a key from [api.nasa.gov](https://api.nasa.gov). Without it the app uses `DEMO_KEY` (30 requests/hour, 50/day).

## Scripts

- `npm run dev` — Vite
- `npm run build` — typecheck and production build
- `npm run lint` — oxlint
- `npm run fmt` / `npm run fmt:check` — oxfmt

## Modes

| Control  | Retrieval                 | Fetch                                                    |
| -------- | ------------------------- | -------------------------------------------------------- |
| Day      | one APOD                  | live                                                     |
| Range    | consecutive dates, max 30 | default Range on first load; **Show** applies a new span |
| Surprise | random set, default 6–12  | default Surprise on first load; **Surprise** draws again |
