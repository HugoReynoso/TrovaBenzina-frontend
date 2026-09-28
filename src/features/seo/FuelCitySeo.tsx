import Link from "next/link";
import { filterReliableStations, formatEuro, getStationPrice, latestCommunicationTime, MAX_PRICE_AGE_DAYS, sortStationsByPrice } from "@/lib/price";
import { absoluteUrl, breadcrumbJsonLd, cityFuelPath, fuelSeo } from "@/lib/seo";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";
import type { CityFuelStatistic } from "@/types/statistics";

interface FuelCitySeoProps {
  city: City;
  cities: City[];
  fuelType: Extract<FuelTypeCode, "BENZINA" | "DIESEL" | "GPL">;
  stations: Station[];
  statistic: CityFuelStatistic;
  serviceMode?: ServiceMode;
}

function formatDate(value?: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function latestCommunication(stations: Station[], fuelType: FuelTypeCode): string | null {
  const latest = stations
    .flatMap((station) => station.prices.filter((price) => price.fuelTypeCode === fuelType).map((price) => price.communicatedAt))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return formatDate(latest);
}

function relatedCities(city: City, cities: City[]): City[] {
  const sameRegion = cities.filter((item) => item.slug !== city.slug && item.regionName === city.regionName);
  const sameProvince = cities.filter((item) => item.slug !== city.slug && item.provinceId === city.provinceId);
  const combined = [...sameProvince, ...sameRegion].filter((item, index, all) => all.findIndex((candidate) => candidate.slug === item.slug) === index);

  return combined.slice(0, 8);
}

function serviceModeLabel(mode: ServiceMode): string {
  if (mode === "self") {
    return "self service";
  }
  if (mode === "served") {
    return "servito";
  }
  return "miglior prezzo tra self e servito";
}

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function FuelCitySeo({ city, cities, fuelType, stations, statistic, serviceMode }: FuelCitySeoProps) {
  const fuel = fuelSeo[fuelType];
  const mode = serviceMode ?? fuel.serviceMode;
  // Solo prezzi comunicati negli ultimi giorni (rispetto all'ultimo aggiornamento dei dati):
  // i prezzi vecchi di mesi o anni falserebbero minimo, media e classifica.
  const recentStations = sortStationsByPrice(
    filterReliableStations(stations, fuelType, mode, latestCommunicationTime(stations)),
    fuelType,
    mode
  );
  const recentPrices = recentStations
    .map((station) => getStationPrice(station, fuelType, mode)?.price)
    .filter((price): price is number => typeof price === "number");
  const hasRecentPrices = recentPrices.length > 0;
  const averagePrice = hasRecentPrices ? average(recentPrices) : 0;
  const minimumPrice = hasRecentPrices ? Math.min(...recentPrices) : 0;
  const topStations = recentStations.slice(0, 5);
  const cheapestStation = topStations[0];
  const cheapestPrice = cheapestStation ? getStationPrice(cheapestStation, fuelType, mode) : undefined;
  const latestDate = latestCommunication(stations, fuelType) ?? formatDate(statistic.updatedAt);
  const modeLabel = serviceModeLabel(mode);
  const fuelWithArticle = fuelType === "BENZINA" ? "la benzina" : fuelType === "DIESEL" ? "il diesel" : "il GPL";
  const pageUrl = absoluteUrl(`${cityFuelPath(fuelType, city.slug)}/`);

  const faqs: Array<{ question: string; answer: string }> = [
    {
      question: `Quanto costa ${fuelWithArticle} oggi a ${city.name}?`,
      answer: hasRecentPrices
        ? `In provincia di ${city.provinceName} il prezzo medio ${fuel.label} (${modeLabel}) è di ${formatEuro(averagePrice)} al litro, con un minimo di ${formatEuro(minimumPrice)}, calcolato su ${recentPrices.length} distributori con prezzo comunicato negli ultimi ${MAX_PRICE_AGE_DAYS} giorni${latestDate ? ` (ultimo aggiornamento: ${latestDate})` : ""}.`
        : `Al momento non ci sono prezzi ${fuel.label} comunicati negli ultimi ${MAX_PRICE_AGE_DAYS} giorni in provincia di ${city.provinceName}. Consulta la mappa per vedere gli ultimi prezzi disponibili.`
    },
    {
      question: `Qual è il distributore ${fuel.label} più economico a ${city.name}?`,
      answer:
        cheapestStation && cheapestPrice
          ? `Il prezzo più basso rilevato in provincia di ${city.provinceName} è ${formatEuro(cheapestPrice.price)} al litro da ${cheapestStation.name} (${cheapestStation.brand}), ${cheapestStation.address}${cheapestStation.cityName ? `, ${cheapestStation.cityName}` : ""}, comunicato il ${formatDate(cheapestPrice.communicatedAt) ?? "giorno non disponibile"}.`
          : `Non ci sono abbastanza prezzi recenti per indicare il distributore più economico: prova a cambiare carburante o modalità nella mappa.`
    },
    {
      question: "Da dove arrivano i prezzi dei carburanti?",
      answer:
        "I gestori degli impianti sono obbligati a comunicare i prezzi praticati al Ministero delle Imprese e del Made in Italy (MIMIT), che li pubblica come dati aperti. TrovaBenzina li raccoglie e mostra per ogni distributore la data dell'ultima comunicazione."
    },
    {
      question: "Ogni quanto vengono aggiornati i prezzi?",
      answer: `I dati vengono aggiornati ogni giorno. Nelle classifiche mostriamo solo i prezzi comunicati negli ultimi ${MAX_PRICE_AGE_DAYS} giorni, così eviti distributori con prezzi non più validi.`
    }
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer }
      }))
    },
    ...(topStations.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Distributori ${fuel.label} più economici in provincia di ${city.provinceName}`,
            url: pageUrl,
            numberOfItems: topStations.length,
            itemListElement: topStations.map((station, index) => {
              const price = getStationPrice(station, fuelType, mode);
              return {
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "GasStation",
                  name: station.name,
                  brand: station.brand ? { "@type": "Brand", name: station.brand } : undefined,
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: station.address,
                    addressLocality: station.cityName,
                    addressRegion: station.provinceName,
                    addressCountry: "IT"
                  },
                  geo: { "@type": "GeoCoordinates", latitude: station.latitude, longitude: station.longitude },
                  makesOffer: price
                    ? {
                        "@type": "Offer",
                        price: price.price.toFixed(3),
                        priceCurrency: "EUR",
                        validFrom: price.communicatedAt,
                        itemOffered: { "@type": "Product", name: `${fuel.titleLabel} ${price.selfService ? "self service" : "servito"}` }
                      }
                    : undefined
                }
              };
            })
          }
        ]
      : [])
  ];
  const relatedFuelTypes = (["BENZINA", "DIESEL", "GPL"] as const).filter((item) => item !== fuelType);
  const nearbyCities = relatedCities(city, cities);
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Prezzi carburanti", path: "/prezzi-carburanti" },
    { name: city.regionName },
    { name: city.name },
    { name: fuel.titleLabel, path: cityFuelPath(fuelType, city.slug) }
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-5 md:px-6" aria-labelledby="seo-intro">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink/58" aria-label="Breadcrumb">
        <Link className="hover:text-petrol" href="/">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link className="hover:text-petrol" href="/prezzi-carburanti">
          Prezzi carburanti
        </Link>
        <span aria-hidden="true">/</span>
        <span>{city.regionName}</span>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{city.name}</span>
      </nav>
      <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm">
        <div className="grid gap-2">
          <p className="text-sm font-black uppercase tracking-[0.08em] text-amber">Dati disponibili MIMIT</p>
          <h1 id="seo-intro" className="text-2xl font-black leading-tight text-ink md:text-3xl">
            Prezzi {fuel.label} a {city.name}
          </h1>
          <p className="max-w-4xl text-ink/70">
            Consulta i prezzi {fuel.label} disponibili a {city.name} e confronta i distributori per trovare le opzioni più convenienti. I dati sui prezzi
            provengono dalle comunicazioni ufficiali disponibili tramite MIMIT e possono avere date di comunicazione diverse.
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md bg-ink/[0.035] p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink/56">Prezzo minimo ({modeLabel})</dt>
            <dd className="mt-1 text-lg font-black text-ink">{hasRecentPrices ? formatEuro(minimumPrice) : "Non disponibile"}</dd>
          </div>
          <div className="rounded-md bg-ink/[0.035] p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink/56">Prezzo medio ({modeLabel})</dt>
            <dd className="mt-1 text-lg font-black text-ink">{hasRecentPrices ? formatEuro(averagePrice) : "Non disponibile"}</dd>
          </div>
          <div className="rounded-md bg-ink/[0.035] p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink/56">Distributori con prezzo recente</dt>
            <dd className="mt-1 text-lg font-black text-ink">{recentPrices.length}</dd>
          </div>
          <div className="rounded-md bg-ink/[0.035] p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink/56">Ultima comunicazione prezzo</dt>
            <dd className="mt-1 text-lg font-black text-ink">{latestDate ?? "Non disponibile"}</dd>
          </div>
        </dl>
        {topStations.length > 0 ? (
          <div className="grid gap-2">
            <h3 className="text-base font-black text-ink">Distributori più convenienti rilevati</h3>
            <ol className="grid gap-2 md:grid-cols-2">
              {topStations.map((station) => {
                const price = getStationPrice(station, fuelType, mode);
                return (
                  <li key={station.id} className="rounded-md border border-ink/10 p-3">
                    <span className="block font-black text-ink">{station.name}</span>
                    <span className="mt-1 block text-sm text-ink/64">{station.address}</span>
                    <span className="mt-2 block text-sm font-black text-mint">{price ? formatEuro(price.price) : "Prezzo non disponibile"}</span>
                    {price ? (
                      <span className="mt-1 block text-xs font-bold text-ink/52">
                        Comunicazione prezzo: {formatDate(price.communicatedAt) ?? "data non disponibile"}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <nav className="flex flex-wrap gap-2" aria-label={`Prezzi carburanti a ${city.name}`}>
            {relatedFuelTypes.map((relatedFuelType) => (
              <Link
                key={relatedFuelType}
                className="rounded-md border border-petrol/20 px-3 py-2 text-sm font-black text-petrol hover:border-petrol/45"
                href={cityFuelPath(relatedFuelType, city.slug)}
              >
                {fuelSeo[relatedFuelType].titleLabel} {city.name}
              </Link>
            ))}
          </nav>
          {nearbyCities.length > 0 ? (
            <nav className="flex flex-wrap gap-2 md:justify-end" aria-label="Località correlate">
              {nearbyCities.map((relatedCity) => (
                <Link
                  key={relatedCity.slug}
                  className="rounded-md border border-ink/10 px-3 py-2 text-sm font-black text-ink/70 hover:border-petrol/35 hover:text-petrol"
                  href={cityFuelPath(fuelType, relatedCity.slug)}
                >
                  {relatedCity.name}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        <div className="grid gap-2 border-t border-ink/10 pt-4">
          <h2 className="text-lg font-black text-ink">Domande frequenti sul prezzo {fuel.label} a {city.name}</h2>
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-md bg-ink/[0.035] p-3">
              <summary className="cursor-pointer font-black text-ink">{faq.question}</summary>
              <p className="mt-2 text-sm text-ink/72">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
