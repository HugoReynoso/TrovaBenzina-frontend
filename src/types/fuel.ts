export type FuelTypeCode = "BENZINA" | "DIESEL" | "GPL" | "METANO";

export interface FuelType {
  code: FuelTypeCode;
  name: string;
  slug: string;
}

export type ServiceMode = "self" | "served" | "all";

export const FUEL_TYPES: FuelType[] = [
  { code: "BENZINA", name: "Benzina", slug: "benzina" },
  { code: "DIESEL", name: "Diesel", slug: "diesel" },
  { code: "GPL", name: "GPL", slug: "gpl" },
  { code: "METANO", name: "Metano", slug: "metano" }
];
