import type { City } from "@/types/location";

/** Citta mostrate in evidenza (link rapidi in Home). */
export const FEATURED_CITY_SLUGS = ["milano", "roma", "torino", "napoli", "bologna", "firenze"];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
}

/**
 * Province il cui capoluogo non ha lo stesso nome della provincia
 * (chiave: nome provincia normalizzato, valore: nome capoluogo normalizzato).
 */
const PROVINCE_CAPITAL_OVERRIDES: Record<string, string> = {
  barlettaandriatrani: "barletta",
  forlicesena: "forli",
  galluranordestsardegna: "olbia",
  massacarrara: "massa",
  mediocampidano: "sanluri",
  monzaedellabrianza: "monza",
  ogliastra: "tortoli",
  pesaroeurbino: "pesaro",
  sulcisiglesiente: "carbonia",
  valledaosta: "aosta",
  verbanocusioossola: "verbania"
};

/**
 * Tutti i capoluoghi di provincia presenti nei dati: per ognuno generiamo le pagine
 * "prezzo benzina/diesel/GPL [citta]" e lo storico, ordinati per nome.
 */
export function getSeoCities(cities: City[]): City[] {
  const byProvince = new Map<string, City[]>();
  for (const city of cities) {
    const list = byProvince.get(city.provinceName) ?? [];
    list.push(city);
    byProvince.set(city.provinceName, list);
  }

  const capitals = new Map<string, City>();
  for (const [provinceName, provinceCities] of byProvince) {
    const provinceKey = normalize(provinceName);
    const capitalKey = PROVINCE_CAPITAL_OVERRIDES[provinceKey] ?? provinceKey;
    const capital = provinceCities.find((city) => normalize(city.name) === capitalKey);
    if (capital && !capitals.has(capital.slug)) {
      capitals.set(capital.slug, capital);
    }
  }

  const result = [...capitals.values()].sort((left, right) => left.name.localeCompare(right.name, "it"));
  if (result.length > 0) {
    return result;
  }

  // Sicurezza: se i nomi non combaciano (dati inattesi) usiamo almeno le citta in evidenza.
  const featured = cities.filter((city) => FEATURED_CITY_SLUGS.includes(city.slug));
  return featured.length > 0 ? featured : cities.slice(0, 6);
}

/** Capoluoghi raggruppati per regione (per la pagina indice). */
export function groupCitiesByRegion(cities: City[]): Array<{ regionName: string; cities: City[] }> {
  const groups = new Map<string, City[]>();
  for (const city of cities) {
    const list = groups.get(city.regionName) ?? [];
    list.push(city);
    groups.set(city.regionName, list);
  }
  return [...groups.entries()]
    .map(([regionName, regionCities]) => ({
      regionName,
      cities: regionCities.sort((left, right) => left.name.localeCompare(right.name, "it"))
    }))
    .sort((left, right) => left.regionName.localeCompare(right.regionName, "it"));
}
