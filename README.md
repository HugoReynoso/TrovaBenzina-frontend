# TrovaBenzina Frontend

Frontend Next.js di TrovaBenzina: mappa prezzi carburanti, confronto distributori, statistiche, storico prezzi, segnalazioni utente e area admin collegata al backend Spring Boot.

## Demo

Demo GitHub Pages:

https://hugoreynoso.github.io/TrovaBenzina-frontend/

La demo statica viene pubblicata da GitHub Actions. Per funzionare fuori dal PC locale richiede una URL backend pubblica configurata nella repository variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://url-pubblica-del-backend
```

In locale il valore usato e:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Stack

- Next.js App Router con export statico
- TypeScript
- Tailwind CSS
- Leaflet e OpenStreetMap
- Recharts
- Vitest
- GitHub Actions e GitHub Pages

## Avvio Locale

Avvia prima il backend Spring Boot su `http://localhost:8080`, poi:

```bash
npm install
npm run dev
```

Il frontend parte da:

```text
http://localhost:3000
```

Configura `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Funzionalita

- Selezione citta, provincia e comuni principali
- Geolocalizzazione con fallback su Milano
- Mappa distributori con marker prezzo e brand
- Logo IP e immagine generica per pompe bianche
- Top 5 prezzi piu economici, ottimizzato anche per mobile
- Grafico storico prezzi con fallback visuale quando lo storico backend e vuoto
- Infografica accise/prezzo ingrandibile su desktop
- Form segnalazione prezzo con ricerca citta e caricamento distributori reali
- Admin login tramite backend, token JWT e chiamate protette
- Loading e error state per lentezza o indisponibilita backend
- SEO con metadata, canonical, sitemap e robots

## Route Principali

- `/`
- `/prezzo-benzina/[city]`
- `/prezzo-diesel/[city]`
- `/prezzo-gpl/[city]`
- `/storico-prezzo-benzina/[city]`
- `/accise-benzina`
- `/segnala-prezzo`
- `/admin` noindex
- `/notizie`
- `/notizie/[slug]`

## Backend API

Il frontend usa JSON camelCase dal backend Spring Boot.

Endpoint pubblici:

- `GET /api/regions`
- `GET /api/provinces`
- `GET /api/provinces?regionId={regionId}`
- `GET /api/cities`
- `GET /api/cities?provinceId={provinceId}`
- `GET /api/stations?cityId={cityId}&fuelType={fuelType}`
- `GET /api/stations?cityId={cityId}&fuelType={fuelType}&selfService={true|false}`
- `GET /api/stations/{id}`
- `GET /api/stations/cheapest?cityId={cityId}&fuelType={fuelType}&limit={limit}`
- `GET /api/cities/{cityId}/fuel-statistics?fuelType={fuelType}`
- `GET /api/cities/{cityId}/fuel-statistics/history?fuelType={fuelType}`
- `POST /api/price-reports`

Endpoint admin:

- `POST /api/auth/login`
- `GET /api/admin/price-reports`
- `PATCH /api/admin/price-reports/{id}/approve`
- `PATCH /api/admin/price-reports/{id}/reject`
- `GET /api/admin/logs`

Gli endpoint admin richiedono:

```text
Authorization: Bearer <token>
```

## Comandi

```bash
npm run build
npm run test
```

Il progetto ha anche lo script:

```bash
npm run lint
```

## Deploy GitHub Pages

Il deploy parte a ogni push su `main` e puo essere avviato manualmente da GitHub Actions.

Workflow:

```text
.github/workflows/deploy-pages.yml
```

Prima di pubblicare una demo funzionante, imposta in GitHub:

```text
Settings -> Secrets and variables -> Actions -> Variables
NEXT_PUBLIC_API_BASE_URL=https://url-pubblica-del-backend
```

La build usa:

```bash
GITHUB_PAGES=true npm run build
```

Questo abilita:

```text
basePath=/TrovaBenzina-frontend
```

necessario per servire correttamente asset e pagine da GitHub Pages.

## Note SEO

- Le pagine pubbliche espongono metadata e canonical.
- La sitemap include homepage, pagine carburante/citta principali, storico, accise, notizie e segnalazione.
- `/admin` e `noindex`.
- Le pagine citta generate staticamente sono limitate alle citta SEO principali per evitare build troppo pesanti.
