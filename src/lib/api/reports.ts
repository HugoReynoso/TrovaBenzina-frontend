import type { AdminLogEntry, PriceReport } from "@/types/report";
import { apiGet, apiRequest } from "./client";

export type CreatePriceReportInput = Omit<PriceReport, "id" | "status" | "submittedAt">;

export async function createPriceReport(input: CreatePriceReportInput): Promise<PriceReport> {
  return apiRequest<PriceReport>("/api/price-reports", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" }
  });
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function getPriceReports(token: string): Promise<PriceReport[]> {
  return apiGet<PriceReport[]>("/api/admin/price-reports", {
    headers: authHeaders(token),
    cache: "no-store"
  });
}

export async function approvePriceReport(id: number, token: string): Promise<PriceReport> {
  return apiRequest<PriceReport>(`/api/admin/price-reports/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(token)
  });
}

export async function rejectPriceReport(id: number, token: string): Promise<PriceReport> {
  return apiRequest<PriceReport>(`/api/admin/price-reports/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(token)
  });
}

export async function getAdminLogs(token: string): Promise<AdminLogEntry[]> {
  return apiGet<AdminLogEntry[]>("/api/admin/logs", {
    headers: authHeaders(token),
    cache: "no-store"
  });
}
