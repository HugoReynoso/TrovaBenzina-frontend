import type { Metadata } from "next";
import { CityFuelPage, cityFuelMetadata, cityFuelStaticParams } from "@/features/seo/CityFuelPage";

interface PageProps {
  params: Promise<{ city: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  return cityFuelMetadata("es", "DIESEL", city);
}

export function generateStaticParams() {
  return cityFuelStaticParams("es");
}

export default async function DieselCityPageEs({ params }: PageProps) {
  const { city } = await params;
  return <CityFuelPage locale="es" fuelType="DIESEL" citySlug={city} />;
}
