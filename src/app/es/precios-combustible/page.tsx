import type { Metadata } from "next";
import { FuelPricesIndexPage, fuelPricesIndexMetadata } from "@/features/seo/FuelPricesIndexPage";

export const metadata: Metadata = fuelPricesIndexMetadata("es");

export default function FuelPricesIndex() {
  return <FuelPricesIndexPage locale="es" />;
}
