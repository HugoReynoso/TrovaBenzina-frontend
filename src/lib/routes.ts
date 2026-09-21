import type { FuelTypeCode } from "@/types/fuel";

export function cityPricePath(fuelType: FuelTypeCode, citySlug: string): string {
  const segment = fuelType === "DIESEL" ? "prezzo-diesel" : fuelType === "GPL" ? "prezzo-gpl" : "prezzo-benzina";
  return `/${segment}/${citySlug}`;
}
