import type { Metadata } from "next";
import { ForeignMapPage, foreignMapMetadata } from "@/features/seo/ForeignMapPage";

export const metadata: Metadata = foreignMapMetadata("es");

export default function LocaleMapPage() {
  return <ForeignMapPage locale="es" />;
}
