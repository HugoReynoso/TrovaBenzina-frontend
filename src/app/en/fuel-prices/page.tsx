import type { Metadata } from "next";
import { FuelPricesIndexPage, fuelPricesIndexMetadata } from "@/features/seo/FuelPricesIndexPage";

export const metadata: Metadata = fuelPricesIndexMetadata("en");

export default function FuelPricesIndex() {
  return <FuelPricesIndexPage locale="en" />;
}
