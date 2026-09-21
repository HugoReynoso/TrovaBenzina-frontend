# TrovaBenzina Frontend

Frontend Next.js per TrovaBenzina, sito italiano per confrontare prezzi carburanti, trovare distributori economici su mappa e preparare pagine SEO indicizzabili per citta e carburante.

## Demo

Demo GitHub Pages:

https://hugoreynoso.github.io/TrovaBenzina-frontend/

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- Leaflet e OpenStreetMap
- Recharts
- Vitest

## Avvio

```bash
npm install
npm run dev
```

Il sito parte da `http://localhost:3000`.

## Env

Copia `.env.example` in `.env.local` quando il backend Spring Boot sara disponibile.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Il codice non hardcoda localhost: se la variabile non e configurata o il backend non risponde, usa mock data separati in `src/mocks`.

## Struttura

```text
src/
  app/                 route App Router, metadata, sitemap, robots
  components/          componenti layout riutilizzabili
  features/            mappa, filtri, stazioni, statistiche, news
  lib/api/             layer API verso Spring Boot con fallback mock
  lib/price.ts         utility prezzo, colore marker e ordinamento
  mocks/               dati mock separati dal codice reale
  types/               tipi TypeScript API
  test/                setup test
```

## Route principali

- `/`
- `/prezzo-benzina/milano`
- `/prezzo-diesel/milano`
- `/prezzo-gpl/milano`
- `/storico-prezzo-benzina/milano`
- `/accise-benzina`
- `/segnala-prezzo`
- `/admin` noindex, mock admin in attesa di autenticazione backend
- `/notizie`
- `/notizie/[slug]`

Le route citta sono predisposte anche per Roma, Torino, Napoli, Bologna e Firenze.

## Backend API attese

- `GET /api/regions`
- `GET /api/provinces?regionId=1`
- `GET /api/cities?provinceId=1`
- `GET /api/stations?cityId=1&fuelType=BENZINA&selfService=true`
- `GET /api/stations/{id}`
- `GET /api/stations/cheapest?cityId=1&fuelType=BENZINA&limit=10`
- `GET /api/cities/{cityId}/fuel-statistics?fuelType=BENZINA`
- `GET /api/cities/{cityId}/fuel-statistics/history?fuelType=BENZINA`

## Comandi

```bash
npm run lint
npm run build
npm run test
```

## Deploy GitHub Pages

Il deploy statico avviene tramite GitHub Actions su ogni push verso `main`.

Workflow:

```text
.github/workflows/deploy-pages.yml
```

La build usa:

```bash
GITHUB_PAGES=true npm run build
```

Questo abilita il `basePath` `/TrovaBenzina-frontend`, necessario per servire correttamente asset e pagine dal repository GitHub Pages.

## Note

- I prezzi attuali sono mock realistici e chiaramente separati in `src/mocks`.
- La mappa Leaflet e caricata solo lato client per evitare problemi SSR.
- Le pagine includono contenuto HTML indicizzabile oltre alla mappa.
- Il selettore lingua e predisposto con `hreflang`; la traduzione dei contenuti andra collegata alla futura strategia i18n.
- Le segnalazioni prezzo restano in stato `pending` e sono visibili nella pagina admin mock.
- La pagina admin e noindex e dovra essere protetta dal backend prima della produzione.
