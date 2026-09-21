import type { FuelTypeCode } from "./fuel";

export type PriceReportStatus = "pending" | "approved" | "rejected";
export type LogLevel = "info" | "warning" | "error";

export interface PriceReport {
  id: number;
  stationId: number;
  stationName: string;
  brand: string;
  cityName: string;
  fuelTypeCode: FuelTypeCode;
  price: number;
  selfService: boolean;
  reporterName?: string;
  reporterEmail?: string;
  note?: string;
  status: PriceReportStatus;
  submittedAt: string;
}

export interface AdminLogEntry {
  id: number;
  level: LogLevel;
  area: "api" | "frontend" | "reports" | "crawler";
  message: string;
  createdAt: string;
}
