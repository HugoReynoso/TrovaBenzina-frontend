import { mockPriceReports } from "@/mocks/reports";
import type { PriceReport } from "@/types/report";
import { apiGet } from "./client";

export type CreatePriceReportInput = Omit<PriceReport, "id" | "status" | "submittedAt">;

export async function createPriceReport(input: CreatePriceReportInput): Promise<PriceReport> {
  try {
    const response = await apiGet<PriceReport>("/api/price-reports", {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" }
    });
    return response;
  } catch {
    return {
      ...input,
      id: Date.now(),
      status: "pending",
      submittedAt: new Date().toISOString()
    };
  }
}

export async function getPriceReports(): Promise<PriceReport[]> {
  try {
    return await apiGet<PriceReport[]>("/api/admin/price-reports");
  } catch {
    return mockPriceReports;
  }
}
