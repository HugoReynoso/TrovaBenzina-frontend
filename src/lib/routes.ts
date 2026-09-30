import type { FuelTypeCode } from "@/types/fuel";

export function cityPricePath(fuelType: FuelTypeCode, citySlug: string): string {
  const segment = { BENZINA: "prezzo-benzina", DIESEL: "prezzo-diesel", GPL: "prezzo-gpl", METANO: "prezzo-metano" }[fuelType];
  return `/${segment}/${citySlug}`;
}
