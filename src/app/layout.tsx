import type { Metadata } from "next";
import { RouteLoadingIndicator } from "@/components/RouteLoadingIndicator";
import { alternateLanguages } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.trovabenzina.it"),
  applicationName: "TrovaBenzina",
  title: {
    default: "TrovaBenzina - Trova il pieno che fa meno male",
    template: "%s | TrovaBenzina"
  },
  description:
    "Trova distributori economici vicino a te, confronta prezzi benzina, diesel, GPL e metano su mappa e consulta statistiche carburante in Italia.",
  keywords: [
    "prezzo benzina",
    "prezzo diesel",
    "distributori economici",
    "benzina vicino a me",
    "GPL",
    "metano",
    "carburanti Italia",
    "TrovaBenzina"
  ],
  authors: [{ name: "TrovaBenzina" }],
  creator: "TrovaBenzina",
  publisher: "TrovaBenzina",
  formatDetection: {
    telephone: false,
    address: false,
    email: false
  },
  alternates: {
    canonical: "/",
    languages: alternateLanguages
  },
  openGraph: {
    title: "TrovaBenzina - Prezzi carburante vicino a te",
    description: "Confronta distributori, prezzi carburante e stazioni economiche sulla mappa.",
    url: "https://www.trovabenzina.it",
    type: "website",
    locale: "it_IT",
    siteName: "TrovaBenzina",
    images: [
      {
        url: "/brand/trovabenzina-concept.png",
        width: 1200,
        height: 630,
        alt: "TrovaBenzina - mappa prezzi carburante"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "TrovaBenzina - Prezzi carburante vicino a te",
    description: "Trova distributori economici, benzina, diesel, GPL e metano sulla mappa.",
    images: ["/brand/trovabenzina-concept.png"]
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
    description: "Trova distributori economici e confronta i prezzi carburante in Italia.",
    url: "https://www.trovabenzina.it",
    inLanguage: "it-IT",
    publisher: {
      "@type": "Organization",
      name: "TrovaBenzina",
      url: "https://www.trovabenzina.it"
    },
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
