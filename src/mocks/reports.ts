import type { AdminLogEntry, PriceReport } from "@/types/report";

export const mockPriceReports: PriceReport[] = [
  {
    id: 9001,
    stationId: 103,
    stationName: "IP Navigli",
    brand: "IP",
    cityName: "Milano",
    fuelTypeCode: "BENZINA",
    price: 1.689,
    selfService: true,
    reporterName: "Utente mobile",
    note: "Prezzo visto sul tabellone alle 08:10.",
    status: "pending",
    submittedAt: "2026-09-21T08:20:00.000Z"
  },
  {
    id: 9002,
    stationId: 101,
    stationName: "Q8 Loreto",
    brand: "Q8",
    cityName: "Milano",
    fuelTypeCode: "DIESEL",
    price: 1.632,
    selfService: true,
    reporterEmail: "utente@example.com",
    status: "pending",
    submittedAt: "2026-09-21T09:05:00.000Z"
  }
];

export const mockAdminLogs: AdminLogEntry[] = [
  {
    id: 7101,
    level: "warning",
    area: "api",
    message: "Fallback mock attivato: NEXT_PUBLIC_API_BASE_URL non configurato o backend non raggiungibile.",
    createdAt: "2026-09-21T09:12:00.000Z"
  },
  {
    id: 7102,
    level: "info",
    area: "reports",
    message: "Nuova segnalazione prezzo ricevuta per IP Navigli.",
    createdAt: "2026-09-21T08:20:00.000Z"
  },
  {
    id: 7103,
    level: "error",
    area: "frontend",
    message: "Esempio log bug: errore client non bloccante nella futura integrazione monitoring.",
    createdAt: "2026-09-20T18:42:00.000Z"
  }
];
