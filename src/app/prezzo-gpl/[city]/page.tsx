import type { Metadata } from "next";
import { CityFuelPage, cityFuelMetadata, cityFuelStaticParams } from "@/features/seo/CityFuelPage";

interface PageProps {
  params: Promise<{ city: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  return cityFuelMetadata("it", "GPL", city);
}

export function generateStaticParams() {
  return cityFuelStaticParams("it");
}

export default async function GplCityPage({ params }: PageProps) {
  const { city } = await params;
  return <CityFuelPage locale="it" fuelType="GPL" citySlug={city} />;
}
