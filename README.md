# Picture of the Day

A React viewer for NASA’s Astronomy Picture of the Day. It opens on **Today** (America/New_York), then lets you step a Day, show a 7-day **Window**, or draw a random **Sample**.

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

| Control  | Domain                    | Fetch                                                     |
| -------- | ------------------------- | --------------------------------------------------------- |
| Day      | one APOD                  | live                                                      |
| Range    | Window, max 7 days        | default Window on first load; **Show** applies a new span |
| Surprise | Sample, default 6, max 12 | default Sample on first load; **Surprise me** draws again |
