import type { Metadata } from "next";
import { RouteLoadingIndicator } from "@/components/RouteLoadingIndicator";
import { alternateLanguages } from "@/lib/i18n";
import { defaultOgImage, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "TrovaBenzina | Prezzi benzina, diesel e GPL in Italia",
    template: `%s | ${siteName}`
  },
  description:
    "Confronta i prezzi di benzina, diesel e GPL nei distributori italiani. Trova i distributori piu economici, consulta la mappa e verifica la data dell'ultimo prezzo comunicato.",
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
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
      url: siteUrl,
      logo: `${siteUrl}/brand/trovabenzina-logo.svg`
    }
  ];

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
