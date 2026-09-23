import type { Metadata } from "next";
import { RouteLoadingIndicator } from "@/components/RouteLoadingIndicator";
import { alternateLanguages } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.trovabenzina.it"),
  title: {
    default: "TrovaBenzina - Trova il pieno che fa meno male",
    template: "%s | TrovaBenzina"
  },
  description:
    "Consulta prezzi benzina, diesel, GPL e metano, trova i distributori piu economici sulla mappa e confronta statistiche e storico.",
  alternates: {
    canonical: "/",
    languages: alternateLanguages
  },
  openGraph: {
    title: "TrovaBenzina",
    description: "Mappa prezzi carburanti, statistiche e distributori economici in Italia.",
    type: "website",
    locale: "it_IT",
    siteName: "TrovaBenzina"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TrovaBenzina",
    url: "https://www.trovabenzina.it",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.trovabenzina.it/prezzo-benzina/{search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="it" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <RouteLoadingIndicator />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
