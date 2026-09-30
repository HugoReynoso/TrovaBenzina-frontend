import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { BRAND_PAGES, brandPath, findBrandPage, getBrandStats, type FuelBrandStats } from "@/lib/brand-pages";
import { formatEuro, getStationPrice, MAX_PRICE_AGE_DAYS } from "@/lib/price";
import { absoluteUrl, breadcrumbJsonLd, defaultOgImage, siteName } from "@/lib/seo";

interface PageProps {
  params: Promise<{ marchio: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return BRAND_PAGES.map((brand) => ({ marchio: brand.slug }));
}

const FUEL_LABEL = { BENZINA: "benzina", DIESEL: "diesel" } as const;

function euro(value: number | null): string {
  return value === null ? "n.d." : formatEuro(value);
}

function formatDate(time: number): string {
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" }).format(new Date(time));
}

/** "2 centesimi in più" / "1 centesimo in meno" / "in linea" rispetto alla media nazionale. */
function comparison(stats: FuelBrandStats): string | null {
  if (stats.brandTypical === null || stats.nationalTypical === null) {
    return null;
  }
  const cents = Math.round((stats.brandTypical - stats.nationalTypical) * 100);
  if (cents === 0) {
    return "in linea con il prezzo tipico nazionale";
  }
  const amount = `${Math.abs(cents)} ${Math.abs(cents) === 1 ? "centesimo" : "centesimi"}`;
  return cents > 0 ? `${amount} al litro in più del prezzo tipico nazionale` : `${amount} al litro in meno del prezzo tipico nazionale`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { marchio } = await params;
  const brand = findBrandPage(marchio);
  if (!brand) {
    notFound();
  }
  const title = `Prezzi ${brand.name} oggi: benzina e diesel più economici`;
  const description = `Prezzo di benzina e diesel ${brand.name} oggi in Italia: i distributori ${brand.name} più economici, il confronto con la media nazionale e i prezzi regione per regione, con dati ufficiali MIMIT.`;
  const path = brandPath(brand.slug);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: path,
      type: "website",
      locale: "it_IT",
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: `${siteName} - prezzi ${brand.name}` }]
    },
    twitter: { card: "summary_large_image", title: `${title} | ${siteName}`, description, images: [defaultOgImage] }
  };
}

export default async function BrandPricesPage({ params }: PageProps) {
  const { marchio } = await params;
  const brand = findBrandPage(marchio);
  if (!brand) {
    notFound();
  }

  const stats = await getBrandStats(brand);
  const [petrol, diesel] = stats.fuels;
  const updated = stats.latestUpdate ? formatDate(stats.latestUpdate) : null;
  const path = brandPath(brand.slug);
  const cheapestPetrol = petrol.cheapest[0];
  const cheapestPetrolPrice = cheapestPetrol ? getStationPrice(cheapestPetrol, "BENZINA", "self")?.price : undefined;
  const otherBrands = BRAND_PAGES.filter((item) => item.slug !== brand.slug);

  const faqs = [
    {
      question: `Quanto costa la benzina ${brand.name} oggi?`,
      answer:
        petrol.brandTypical !== null
          ? `Il prezzo tipico della benzina self service nei distributori ${brand.name} è ${euro(petrol.brandTypical)} al litro, ${comparison(petrol)} (${euro(petrol.nationalTypical)}). Il calcolo usa ${petrol.stationCount} distributori ${brand.name} con prezzo comunicato negli ultimi ${MAX_PRICE_AGE_DAYS} giorni${updated ? `, aggiornati al ${updated}` : ""}.`
          : `Al momento non ci sono prezzi recenti della benzina self service nei distributori ${brand.name}.`
    },
    {
      question: `Quanto costa il diesel ${brand.name} oggi?`,
      answer:
        diesel.brandTypical !== null
          ? `Il prezzo tipico del diesel self service nei distributori ${brand.name} è ${euro(diesel.brandTypical)} al litro, ${comparison(diesel)} (${euro(diesel.nationalTypical)}).`
          : `Al momento non ci sono prezzi recenti del diesel self service nei distributori ${brand.name}.`
    },
    {
      question: `Qual è il distributore ${brand.name} più economico?`,
      answer:
        cheapestPetrol && cheapestPetrolPrice
          ? `Per la benzina self service il prezzo più basso tra i distributori ${brand.name} è ${formatEuro(cheapestPetrolPrice)} al litro da ${cheapestPetrol.name}, ${cheapestPetrol.address} (${cheapestPetrol.cityName}).`
          : `Al momento non ci sono prezzi recenti per i distributori ${brand.name}.`
    }
  ];

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Prezzi carburanti", path: "/prezzi-carburanti" },
      { name: brand.name, path }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: "it-IT",
      mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } }))
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Distributori ${brand.name} più economici (benzina self)`,
      url: absoluteUrl(path),
      itemListElement: petrol.cheapest.map((station, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "GasStation",
          name: station.name,
          brand: { "@type": "Brand", name: brand.name },
          address: { "@type": "PostalAddress", streetAddress: station.address, addressLocality: station.cityName, addressCountry: "IT" },
          geo: { "@type": "GeoCoordinates", latitude: station.latitude, longitude: station.longitude }
        }
      }))
    }
  ];

  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 leading-relaxed text-ink/76 md:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink/60" aria-label="Breadcrumb">
          <Link className="hover:text-petrol" href="/">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link className="hover:text-petrol" href="/prezzi-carburanti">
            Prezzi carburanti
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{brand.name}</span>
        </nav>

        <header className="grid gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-3">
            <BrandLogo brand={brand.key === "white" ? "Pompe Bianche" : brand.name} />
            <p className="text-sm font-black uppercase tracking-[0.08em] text-amber">Dati ufficiali MIMIT{updated ? ` · ${updated}` : ""}</p>
          </div>
          <h1 className="text-2xl font-black leading-tight text-ink md:text-3xl">Prezzi {brand.name} oggi: benzina e diesel</h1>
          <p>
            Quanto costano oggi benzina e diesel nei {stats.totalStations.toLocaleString("it-IT")} distributori {brand.name}{" "}
            d&apos;Italia, quali sono i più economici e come si confrontano con il resto del mercato. Prezzi self service
            comunicati al Ministero negli ultimi {MAX_PRICE_AGE_DAYS} giorni, esclusi quelli palesemente errati.
          </p>
          <dl className="grid gap-3 sm:grid-cols-2">
            {stats.fuels.map((fuel) => (
              <div key={fuel.fuelType} className="rounded-md bg-ink/[0.035] p-3">
                <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">
                  Prezzo tipico {FUEL_LABEL[fuel.fuelType]} {brand.name} (self)
                </dt>
                <dd className="mt-1 text-2xl font-black text-ink">{euro(fuel.brandTypical)}</dd>
                <dd className="text-sm">
                  {comparison(fuel) ?? "dato non disponibile"} ({euro(fuel.nationalTypical)})
                </dd>
              </div>
            ))}
          </dl>
        </header>

        {stats.fuels.map((fuel) =>
          fuel.cheapest.length > 0 ? (
            <section key={fuel.fuelType} className="grid gap-3" aria-labelledby={`piu-economici-${fuel.fuelType}`}>
              <h2 id={`piu-economici-${fuel.fuelType}`} className="text-xl font-black text-ink">
                I distributori {brand.name} più economici: {FUEL_LABEL[fuel.fuelType]} self
              </h2>
              <ol className="grid gap-2 md:grid-cols-2">
                {fuel.cheapest.map((station, index) => {
                  const price = getStationPrice(station, fuel.fuelType, "self");
                  return (
                    <li key={station.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-ink/10 bg-white p-3 shadow-sm">
                      <span className="grid size-7 place-items-center rounded-md bg-ink/[0.045] text-xs font-black text-ink">{index + 1}</span>
                      <span className="min-w-0">
                        <span className="block font-black leading-tight text-ink">{station.name}</span>
                        <span className="mt-0.5 block text-sm text-ink/66">
                          {station.address} · {station.cityName} ({station.provinceName})
                        </span>
                      </span>
                      <span className="whitespace-nowrap rounded-md bg-mint px-2 py-1 text-sm font-black text-white">
                        {price ? formatEuro(price.price) : "n.d."}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null
        )}

        {petrol.regions.length > 0 ? (
          <section className="grid gap-3" aria-labelledby="regioni">
            <h2 id="regioni" className="text-xl font-black text-ink">
              Benzina {brand.name}: prezzo tipico regione per regione
            </h2>
            <p>Dalla regione più economica alla più cara (regioni con almeno 3 distributori {brand.name} con prezzo recente).</p>
            <div className="overflow-x-auto rounded-md border border-ink/10 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink/[0.035] text-xs uppercase tracking-[0.08em] text-ink/60">
                  <tr>
                    <th className="px-4 py-2 font-black">Regione</th>
                    <th className="px-4 py-2 text-right font-black">Prezzo tipico self</th>
                    <th className="px-4 py-2 text-right font-black">Distributori</th>
                  </tr>
                </thead>
                <tbody>
                  {petrol.regions.map((row) => (
                    <tr key={row.region} className="border-t border-ink/10">
                      <td className="px-4 py-2 font-bold text-ink">{row.region}</td>
                      <td className="px-4 py-2 text-right font-black tabular-nums text-ink">{formatEuro(row.typical)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{row.stationCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="grid gap-3" aria-labelledby="domande">
          <h2 id="domande" className="text-xl font-black text-ink">
            Domande frequenti sui prezzi {brand.name}
          </h2>
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
              <summary className="cursor-pointer font-black text-ink">{faq.question}</summary>
              <p className="mt-2">{faq.answer}</p>
            </details>
          ))}
        </section>

        <section className="grid gap-3" aria-labelledby="altri">
          <h2 id="altri" className="text-xl font-black text-ink">
            Altri marchi e città
          </h2>
          <nav className="flex flex-wrap gap-2" aria-label="Prezzi di altri marchi">
            {otherBrands.map((item) => (
              <Link
                key={item.slug}
                className="rounded-md border border-petrol/20 bg-white px-3 py-2 text-sm font-black text-petrol hover:border-petrol/45"
                href={brandPath(item.slug)}
              >
                Prezzi {item.name}
              </Link>
            ))}
          </nav>
          <p>
            Per trovare il distributore più economico vicino a te, di qualsiasi marchio, usa la{" "}
            <Link className="font-black text-petrol hover:underline" href="/mappa">
              mappa dei distributori
            </Link>{" "}
            (puoi filtrare anche per marchio) o scegli la tua città tra i{" "}
            <Link className="font-black text-petrol hover:underline" href="/prezzi-carburanti">
              prezzi per capoluogo
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
