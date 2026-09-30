import Link from "next/link";
import {
  cityFuelPathFor,
  intlLocale,
  isTranslatedCity,
  LOCALE_ROUTES,
  LOCALIZED_FUELS,
  localizedCityName,
  type Locale,
  type LocalizedFuel
} from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { filterReliableStations, formatEuro, getStationPrice, latestCommunicationTime, MAX_PRICE_AGE_DAYS, sortStationsByPrice } from "@/lib/price";
import { absoluteUrl, breadcrumbJsonLd, fuelSeo } from "@/lib/seo";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";
import type { CityFuelStatistic } from "@/types/statistics";

interface FuelCitySeoProps {
  city: City;
  cities: City[];
  fuelType: LocalizedFuel;
  stations: Station[];
  statistic: CityFuelStatistic;
  serviceMode?: ServiceMode;
  locale?: Locale;
}

interface SeoCopy {
  home: string;
  fuelPrices: string;
  mimitBadge: string;
  title: (fuel: string, city: string) => string;
  intro: (fuel: string, city: string) => string;
  minimum: (mode: string) => string;
  average: (mode: string) => string;
  recentStations: string;
  lastCommunication: string;
  notAvailable: string;
  cheapestTitle: string;
  priceNotAvailable: string;
  communicatedOn: (date: string) => string;
  dateNotAvailable: string;
  relatedFuelsLabel: (city: string) => string;
  relatedPlaces: string;
  faqTitle: (fuel: string, city: string) => string;
  modeLabel: Record<ServiceMode, string>;
  fuelWithArticle: Record<LocalizedFuel, string>;
  faqCost: (fuelWithArticle: string, city: string) => string;
  faqCostAnswer: (p: { province: string; fuel: string; mode: string; average: string; minimum: string; count: number; days: number; date: string | null }) => string;
  faqCostNoData: (fuel: string, province: string, days: number) => string;
  faqCheapest: (fuel: string, city: string) => string;
  faqCheapestAnswer: (p: { province: string; price: string; name: string; brand: string; address: string; date: string }) => string;
  faqCheapestNoData: string;
  faqSource: string;
  faqSourceAnswer: string;
  faqUpdates: string;
  faqUpdatesAnswer: (days: number) => string;
  listName: (fuel: string, province: string) => string;
  offerName: (fuel: string, self: boolean) => string;
}

const COPY: Record<Locale, SeoCopy> = {
  it: {
    home: "Home",
    fuelPrices: "Prezzi carburanti",
    mimitBadge: "Dati disponibili MIMIT",
    title: (fuel, city) => `Prezzi ${fuel} a ${city}`,
    intro: (fuel, city) =>
      `Consulta i prezzi ${fuel} disponibili a ${city} e confronta i distributori per trovare le opzioni più convenienti. I dati sui prezzi provengono dalle comunicazioni ufficiali disponibili tramite MIMIT e possono avere date di comunicazione diverse.`,
    minimum: (mode) => `Prezzo minimo (${mode})`,
    average: (mode) => `Prezzo medio (${mode})`,
    recentStations: "Distributori con prezzo recente",
    lastCommunication: "Ultima comunicazione prezzo",
    notAvailable: "Non disponibile",
    cheapestTitle: "Distributori più convenienti rilevati",
    priceNotAvailable: "Prezzo non disponibile",
    communicatedOn: (date) => `Comunicazione prezzo: ${date}`,
    dateNotAvailable: "data non disponibile",
    relatedFuelsLabel: (city) => `Prezzi carburanti a ${city}`,
    relatedPlaces: "Località correlate",
    faqTitle: (fuel, city) => `Domande frequenti sul prezzo ${fuel} a ${city}`,
    modeLabel: { self: "self service", served: "servito", all: "miglior prezzo tra self e servito" },
    fuelWithArticle: { BENZINA: "la benzina", DIESEL: "il diesel", GPL: "il GPL", METANO: "il metano" },
    faqCost: (fuelWithArticle, city) => `Quanto costa ${fuelWithArticle} oggi a ${city}?`,
    faqCostAnswer: ({ province, fuel, mode, average, minimum, count, days, date }) =>
      `In provincia di ${province} il prezzo medio ${fuel} (${mode}) è di ${average} al litro, con un minimo di ${minimum}, calcolato su ${count} distributori con prezzo comunicato negli ultimi ${days} giorni${date ? ` (ultimo aggiornamento: ${date})` : ""}.`,
    faqCostNoData: (fuel, province, days) =>
      `Al momento non ci sono prezzi ${fuel} comunicati negli ultimi ${days} giorni in provincia di ${province}. Consulta la mappa per vedere gli ultimi prezzi disponibili.`,
    faqCheapest: (fuel, city) => `Qual è il distributore ${fuel} più economico a ${city}?`,
    faqCheapestAnswer: ({ province, price, name, brand, address, date }) =>
      `Il prezzo più basso rilevato in provincia di ${province} è ${price} al litro da ${name} (${brand}), ${address}, comunicato il ${date}.`,
    faqCheapestNoData:
      "Non ci sono abbastanza prezzi recenti per indicare il distributore più economico: prova a cambiare carburante o modalità nella mappa.",
    faqSource: "Da dove arrivano i prezzi dei carburanti?",
    faqSourceAnswer:
      "I gestori degli impianti sono obbligati a comunicare i prezzi praticati al Ministero delle Imprese e del Made in Italy (MIMIT), che li pubblica come dati aperti. TrovaBenzina li raccoglie e mostra per ogni distributore la data dell'ultima comunicazione.",
    faqUpdates: "Ogni quanto vengono aggiornati i prezzi?",
    faqUpdatesAnswer: (days) =>
      `I dati vengono aggiornati ogni giorno. Nelle classifiche mostriamo solo i prezzi comunicati negli ultimi ${days} giorni, così eviti distributori con prezzi non più validi.`,
    listName: (fuel, province) => `Distributori ${fuel} più economici in provincia di ${province}`,
    offerName: (fuel, self) => `${fuel} ${self ? "self service" : "servito"}`
  },
  en: {
    home: "Home",
    fuelPrices: "Fuel prices",
    mimitBadge: "Official MIMIT data",
    title: (fuel, city) => `${fuel} prices in ${city} today`,
    intro: (fuel, city) =>
      `Compare ${fuel} prices at fuel stations in ${city} and find the cheapest place to fill up. Prices come from the official data that Italian fuel stations must report to the Ministry of Enterprises (MIMIT), so each station shows the date of its latest update.`,
    minimum: (mode) => `Lowest price (${mode})`,
    average: (mode) => `Average price (${mode})`,
    recentStations: "Stations with a recent price",
    lastCommunication: "Latest price update",
    notAvailable: "Not available",
    cheapestTitle: "Cheapest fuel stations",
    priceNotAvailable: "Price not available",
    communicatedOn: (date) => `Price reported on ${date}`,
    dateNotAvailable: "date not available",
    relatedFuelsLabel: (city) => `Fuel prices in ${city}`,
    relatedPlaces: "Other cities",
    faqTitle: (fuel, city) => `FAQ: ${fuel} prices in ${city}`,
    modeLabel: { self: "self-service", served: "full service", all: "best of self-service and full service" },
    fuelWithArticle: { BENZINA: "petrol", DIESEL: "diesel", GPL: "LPG", METANO: "CNG" },
    faqCost: (fuelWithArticle, city) => `How much does ${fuelWithArticle} cost in ${city} today?`,
    faqCostAnswer: ({ province, fuel, mode, average, minimum, count, days, date }) =>
      `In the province of ${province} the average ${fuel} price (${mode}) is ${average} per litre, with a lowest price of ${minimum}, based on ${count} stations that reported their price in the last ${days} days${date ? ` (latest update: ${date})` : ""}.`,
    faqCostNoData: (fuel, province, days) =>
      `There are currently no ${fuel} prices reported in the last ${days} days in the province of ${province}. Check the map for the latest available prices.`,
    faqCheapest: (fuel, city) => `Where is the cheapest ${fuel} in ${city}?`,
    faqCheapestAnswer: ({ province, price, name, brand, address, date }) =>
      `The lowest price in the province of ${province} is ${price} per litre at ${name} (${brand}), ${address}, reported on ${date}.`,
    faqCheapestNoData: "There are not enough recent prices to name the cheapest station: try another fuel or service type on the map.",
    faqSource: "Where do the fuel prices come from?",
    faqSourceAnswer:
      "Italian fuel station operators must report their prices to the Ministry of Enterprises and Made in Italy (MIMIT), which publishes them as open data. TrovaBenzina collects these prices and shows the date of the latest update for every station.",
    faqUpdates: "How often are prices updated?",
    faqUpdatesAnswer: (days) =>
      `Data is updated every day. Rankings only include prices reported in the last ${days} days, so you avoid stations whose prices may be out of date.`,
    listName: (fuel, province) => `Cheapest ${fuel} stations in the province of ${province}`,
    offerName: (fuel, self) => `${fuel} ${self ? "self-service" : "full service"}`
  },
  es: {
    home: "Inicio",
    fuelPrices: "Precios del combustible",
    mimitBadge: "Datos oficiales del MIMIT",
    title: (fuel, city) => `Precio ${fuel} en ${city} hoy`,
    intro: (fuel, city) =>
      `Compara el precio ${fuel} en las gasolineras de ${city} y encuentra dónde repostar más barato. Los precios proceden de los datos oficiales que las gasolineras italianas deben comunicar al Ministerio de Empresas (MIMIT), por eso cada gasolinera muestra la fecha de su última actualización.`,
    minimum: (mode) => `Precio mínimo (${mode})`,
    average: (mode) => `Precio medio (${mode})`,
    recentStations: "Gasolineras con precio reciente",
    lastCommunication: "Última actualización de precios",
    notAvailable: "No disponible",
    cheapestTitle: "Gasolineras más baratas",
    priceNotAvailable: "Precio no disponible",
    communicatedOn: (date) => `Precio comunicado el ${date}`,
    dateNotAvailable: "fecha no disponible",
    relatedFuelsLabel: (city) => `Precios del combustible en ${city}`,
    relatedPlaces: "Otras ciudades",
    faqTitle: (fuel, city) => `Preguntas frecuentes sobre el precio ${fuel} en ${city}`,
    modeLabel: { self: "autoservicio", served: "atendido", all: "mejor precio entre autoservicio y atendido" },
    fuelWithArticle: { BENZINA: "la gasolina", DIESEL: "el diésel", GPL: "el GLP", METANO: "el GNC" },
    faqCost: (fuelWithArticle, city) => `¿Cuánto cuesta ${fuelWithArticle} hoy en ${city}?`,
    faqCostAnswer: ({ province, fuel, mode, average, minimum, count, days, date }) =>
      `En la provincia de ${province} el precio medio ${fuel} (${mode}) es de ${average} por litro, con un mínimo de ${minimum}, calculado sobre ${count} gasolineras que comunicaron su precio en los últimos ${days} días${date ? ` (última actualización: ${date})` : ""}.`,
    faqCostNoData: (fuel, province, days) =>
      `Ahora mismo no hay precios ${fuel} comunicados en los últimos ${days} días en la provincia de ${province}. Consulta el mapa para ver los últimos precios disponibles.`,
    faqCheapest: (fuel, city) => `¿Cuál es la gasolinera más barata para ${fuel} en ${city}?`,
    faqCheapestAnswer: ({ province, price, name, brand, address, date }) =>
      `El precio más bajo de la provincia de ${province} es ${price} por litro en ${name} (${brand}), ${address}, comunicado el ${date}.`,
    faqCheapestNoData: "No hay suficientes precios recientes para indicar la gasolinera más barata: prueba con otro combustible o modalidad en el mapa.",
    faqSource: "¿De dónde proceden los precios del combustible?",
    faqSourceAnswer:
      "Las gasolineras italianas están obligadas a comunicar sus precios al Ministerio de Empresas y del Made in Italy (MIMIT), que los publica como datos abiertos. TrovaBenzina recoge estos precios y muestra la fecha de la última actualización de cada gasolinera.",
    faqUpdates: "¿Cada cuánto se actualizan los precios?",
    faqUpdatesAnswer: (days) =>
      `Los datos se actualizan cada día. En las clasificaciones solo mostramos precios comunicados en los últimos ${days} días, para evitar gasolineras con precios que ya no son válidos.`,
    listName: (fuel, province) => `Gasolineras más baratas para ${fuel} en la provincia de ${province}`,
    offerName: (fuel, self) => `${fuel} ${self ? "autoservicio" : "atendido"}`
  }
};

/** Nome del carburante come compare nei titoli e nel testo della pagina. */
function fuelLabels(locale: Locale, fuelType: LocalizedFuel): { inText: string; title: string } {
  if (locale === "it") {
    return { inText: fuelSeo[fuelType].label, title: fuelSeo[fuelType].titleLabel };
  }
  const t = getMessages(locale);
  if (locale === "es") {
    // "Precio de la gasolina" / "precio del diésel" / "precio del GLP"
    const withPreposition = fuelType === "BENZINA" ? "de la gasolina" : `del ${t.fuelInSentence[fuelType]}`;
    return { inText: withPreposition, title: withPreposition };
  }
  return { inText: t.fuelInSentence[fuelType], title: t.fuelName[fuelType] };
}

function formatDate(value: string | undefined, intl: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(intl, { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function latestCommunication(stations: Station[], fuelType: FuelTypeCode, intl: string): string | null {
  const latest = stations
    .flatMap((station) => station.prices.filter((price) => price.fuelTypeCode === fuelType).map((price) => price.communicatedAt))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return formatDate(latest, intl);
}

function relatedCities(city: City, cities: City[], locale: Locale): City[] {
  // In inglese e spagnolo colleghiamo solo le citta che hanno la pagina tradotta.
  const candidates = locale === "it" ? cities : cities.filter((item) => isTranslatedCity(item.slug));
  const sameRegion = candidates.filter((item) => item.slug !== city.slug && item.regionName === city.regionName);
  const sameProvince = candidates.filter((item) => item.slug !== city.slug && item.provinceId === city.provinceId);
  const others = locale === "it" ? [] : candidates.filter((item) => item.slug !== city.slug);
  const combined = [...sameProvince, ...sameRegion, ...others].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.slug === item.slug) === index
  );

  return combined.slice(0, 8);
}

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function FuelCitySeo({ city, cities, fuelType, stations, statistic, serviceMode, locale = "it" }: FuelCitySeoProps) {
  const copy = COPY[locale];
  const intl = intlLocale(locale);
  const t = getMessages(locale);
  const fuel = fuelSeo[fuelType];
  const labels = fuelLabels(locale, fuelType);
  // Nome "semplice" del carburante (senza articolo) per le frasi spagnole "para gasolina".
  const plainFuel = locale === "es" ? t.fuelInSentence[fuelType] : labels.inText;
  const cityName = localizedCityName(locale, city);
  const mode = serviceMode ?? fuel.serviceMode;
  // Solo prezzi affidabili: comunicati di recente (rispetto all'ultimo aggiornamento dei dati) e non anomali.
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
  const latestDate = latestCommunication(stations, fuelType, intl) ?? formatDate(statistic.updatedAt, intl);
  const modeLabel = copy.modeLabel[mode];
  const pagePath = cityFuelPathFor(locale, fuelType, city.slug);
  const pageUrl = absoluteUrl(`${pagePath}/`);

  const faqs: Array<{ question: string; answer: string }> = [
    {
      question: copy.faqCost(copy.fuelWithArticle[fuelType], cityName),
      answer: hasRecentPrices
        ? copy.faqCostAnswer({
            province: city.provinceName,
            fuel: labels.inText,
            mode: modeLabel,
            average: formatEuro(averagePrice, intl),
            minimum: formatEuro(minimumPrice, intl),
            count: recentPrices.length,
            days: MAX_PRICE_AGE_DAYS,
            date: latestDate
          })
        : copy.faqCostNoData(labels.inText, city.provinceName, MAX_PRICE_AGE_DAYS)
    },
    {
      question: copy.faqCheapest(plainFuel, cityName),
      answer:
        cheapestStation && cheapestPrice
          ? copy.faqCheapestAnswer({
              province: city.provinceName,
              price: formatEuro(cheapestPrice.price, intl),
              name: cheapestStation.name,
              brand: cheapestStation.brand,
              address: `${cheapestStation.address}${cheapestStation.cityName ? `, ${cheapestStation.cityName}` : ""}`,
              date: formatDate(cheapestPrice.communicatedAt, intl) ?? copy.dateNotAvailable
            })
          : copy.faqCheapestNoData
    },
    { question: copy.faqSource, answer: copy.faqSourceAnswer },
    { question: copy.faqUpdates, answer: copy.faqUpdatesAnswer(MAX_PRICE_AGE_DAYS) }
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: intl,
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
            name: copy.listName(plainFuel, city.provinceName),
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
                        itemOffered: { "@type": "Product", name: copy.offerName(t.fuelName[fuelType], price.selfService) }
                      }
                    : undefined
                }
              };
            })
          }
        ]
      : [])
  ];

  const relatedFuelTypes = LOCALIZED_FUELS.filter((item) => item !== fuelType);
  const nearbyCities = relatedCities(city, cities, locale);
  const routes = LOCALE_ROUTES[locale];
  const breadcrumbs = [
    { name: copy.home, path: routes.home },
    { name: copy.fuelPrices, path: routes.fuelIndex },
    { name: city.regionName },
    { name: cityName },
    { name: locale === "it" ? fuel.titleLabel : t.fuelName[fuelType], path: pagePath }
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-5 md:px-6" aria-labelledby="seo-intro">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink/58" aria-label="Breadcrumb">
        <Link className="hover:text-petrol" href={routes.home}>
          {copy.home}
        </Link>
        <span aria-hidden="true">/</span>
        <Link className="hover:text-petrol" href={routes.fuelIndex}>
          {copy.fuelPrices}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{city.regionName}</span>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{cityName}</span>
      </nav>
      <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm">
        <div className="grid gap-2">
          <p className="text-sm font-black uppercase tracking-[0.08em] text-amber">{copy.mimitBadge}</p>
          <h1 id="seo-intro" className="text-2xl font-black leading-tight text-ink md:text-3xl">
            {copy.title(locale === "en" ? labels.title : labels.inText, cityName)}
          </h1>
          <p className="max-w-4xl text-ink/70">{copy.intro(labels.inText, cityName)}</p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md bg-ink/[0.035] p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">{copy.minimum(modeLabel)}</dt>
            <dd className="mt-1 text-lg font-black text-ink">{hasRecentPrices ? formatEuro(minimumPrice, intl) : copy.notAvailable}</dd>
          </div>
          <div className="rounded-md bg-ink/[0.035] p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">{copy.average(modeLabel)}</dt>
            <dd className="mt-1 text-lg font-black text-ink">{hasRecentPrices ? formatEuro(averagePrice, intl) : copy.notAvailable}</dd>
          </div>
          <div className="rounded-md bg-ink/[0.035] p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">{copy.recentStations}</dt>
            <dd className="mt-1 text-lg font-black text-ink">{recentPrices.length}</dd>
          </div>
          <div className="rounded-md bg-ink/[0.035] p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">{copy.lastCommunication}</dt>
            <dd className="mt-1 text-lg font-black text-ink">{latestDate ?? copy.notAvailable}</dd>
          </div>
        </dl>
        {topStations.length > 0 ? (
          <div className="grid gap-2">
            <h3 className="text-base font-black text-ink">{copy.cheapestTitle}</h3>
            <ol className="grid gap-2 md:grid-cols-2">
              {topStations.map((station) => {
                const price = getStationPrice(station, fuelType, mode);
                return (
                  <li key={station.id} className="rounded-md border border-ink/10 p-3">
                    <span className="block font-black text-ink">{station.name}</span>
                    <span className="mt-1 block text-sm text-ink/64">{station.address}</span>
                    <span className="mt-2 block text-sm font-black text-mint">{price ? formatEuro(price.price, intl) : copy.priceNotAvailable}</span>
                    {price ? (
                      <span className="mt-1 block text-xs font-bold text-ink/60">
                        {copy.communicatedOn(formatDate(price.communicatedAt, intl) ?? copy.dateNotAvailable)}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <nav className="flex flex-wrap gap-2" aria-label={copy.relatedFuelsLabel(cityName)}>
            {relatedFuelTypes.map((relatedFuelType) => (
              <Link
                key={relatedFuelType}
                className="rounded-md border border-petrol/20 px-3 py-2 text-sm font-black text-petrol hover:border-petrol/45"
                href={cityFuelPathFor(locale, relatedFuelType, city.slug)}
              >
                {locale === "it" ? fuelSeo[relatedFuelType].titleLabel : t.fuelName[relatedFuelType]} {cityName}
              </Link>
            ))}
          </nav>
          {nearbyCities.length > 0 ? (
            <nav className="flex flex-wrap gap-2 md:justify-end" aria-label={copy.relatedPlaces}>
              {nearbyCities.map((relatedCity) => (
                <Link
                  key={relatedCity.slug}
                  className="rounded-md border border-ink/10 px-3 py-2 text-sm font-black text-ink/70 hover:border-petrol/35 hover:text-petrol"
                  href={cityFuelPathFor(locale, fuelType, relatedCity.slug)}
                >
                  {localizedCityName(locale, relatedCity)}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        <div className="grid gap-2 border-t border-ink/10 pt-4">
          <h2 className="text-lg font-black text-ink">{copy.faqTitle(labels.inText, cityName)}</h2>
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
