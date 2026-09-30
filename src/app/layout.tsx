import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import { RouteLoadingIndicator } from "@/components/RouteLoadingIndicator";
import { defaultOgImage, founder, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "TrovaBenzina | Prezzi benzina, diesel e GPL in Italia",
    template: `%s | ${siteName}`
  },
  description:
    "Confronta i prezzi di benzina, diesel e GPL nei distributori italiani. Trova i distributori più economici, consulta la mappa e verifica la data dell'ultimo prezzo comunicato.",
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    telephone: false,
    address: false,
    email: false
  },
  openGraph: {
    title: "TrovaBenzina | Prezzi carburante in Italia",
    description: "Confronta distributori, prezzi carburante e stazioni economiche sulla mappa con dati disponibili MIMIT.",
    url: siteUrl,
    type: "website",
    locale: "it_IT",
    siteName,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "TrovaBenzina - mappa prezzi carburante"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "TrovaBenzina | Prezzi carburante in Italia",
    description: "Trova distributori economici, benzina, diesel e GPL sulla mappa.",
    images: [defaultOgImage]
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  themeColor: "#165a67"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      alternateName: ["Trova Benzina", "trovabenzina.it"],
      description: "Trova distributori economici e confronta i prezzi carburante in Italia.",
      url: siteUrl,
      inLanguage: "it-IT",
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      alternateName: "Trova Benzina",
      url: siteUrl,
      logo: `${siteUrl}/brand/trovabenzina-logo.svg`,
      email: founder.email,
      founder: { "@type": "Person", name: founder.name, jobTitle: founder.jobTitle, sameAs: [founder.linkedin, founder.github, founder.website] }
    }
  ];

  // Le tessere della mappa arrivano da OpenStreetMap: apriamo la connessione mentre la pagina carica.
  ["a", "b", "c"].forEach((server) => preconnect(`https://${server}.tile.openstreetmap.org`));

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
