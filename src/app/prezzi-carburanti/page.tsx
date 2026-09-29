import type { Metadata } from "next";
import { FuelPricesIndexPage, fuelPricesIndexMetadata } from "@/features/seo/FuelPricesIndexPage";

export const metadata: Metadata = fuelPricesIndexMetadata("it");

export default function FuelPricesIndex() {
  return <FuelPricesIndexPage locale="it" />;
}
