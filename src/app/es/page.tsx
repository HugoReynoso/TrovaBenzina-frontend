import type { Metadata } from "next";
import { ForeignHomePage, foreignHomeMetadata } from "@/features/seo/ForeignHomePage";

export const metadata: Metadata = foreignHomeMetadata("es");

export default function LocaleHomePage() {
  return <ForeignHomePage locale="es" />;
}
