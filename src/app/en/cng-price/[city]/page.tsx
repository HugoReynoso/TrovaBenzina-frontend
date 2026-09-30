import type { Metadata } from "next";
import { CityFuelPage, cityFuelMetadata, cityFuelStaticParams } from "@/features/seo/CityFuelPage";

interface PageProps {
  params: Promise<{ city: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  return cityFuelMetadata("en", "METANO", city);
}

export function generateStaticParams() {
  return cityFuelStaticParams("en");
}

export default async function MetanoCityPage({ params }: PageProps) {
  const { city } = await params;
  return <CityFuelPage locale="en" fuelType="METANO" citySlug={city} />;
}
