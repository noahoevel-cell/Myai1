# MyAI – Cloudflare Workers + Workers AI

Diese Version nutzt einen **Cloudflare Worker mit Static Assets** und keine Pages-Functions.

## Deployment

Voraussetzung: Node.js 16.17 oder neuer.

Im Projektordner:

```bash
npm install
npx wrangler login
npm run deploy
```

`npm run deploy` baut die Vite-Oberfläche und veröffentlicht anschließend den Worker.

Die Datei `wrangler.jsonc` enthält bereits:
- Static Assets aus `dist`
- Worker Entry Point `src/worker.js`
- Workers-AI-Binding mit dem Namen `AI`

Falls Cloudflare nachfragt, bestätige die Worker-Erstellung.

## Wichtig

Die AI-Nutzung selbst ist nicht automatisch unbegrenzt kostenlos. Cloudflare hat je nach Produkt und Tarif Freikontingente und Limits. Kontrolliere deshalb vor größerer Nutzung das Usage/Billing-Dashboard.

## API

`POST /api/chat`

`GET /api/health`

## Hinweis

Die Oberfläche ist eine solide Cloudflare-Grundlage. Bereiche wie Dateien, Agents, Bilder, Sprache, Datenbank und Login sind im UI vorbereitet, aber noch nicht vollständig implementiert.
