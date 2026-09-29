import { describe, expect, it } from "vitest";
import { cityFuelAlternates, equivalentPath, localeFromPathname, localizedCityName } from "./i18n";

describe("i18n", () => {
  it("detects the locale from the path", () => {
    expect(localeFromPathname("/")).toBe("it");
    expect(localeFromPathname("/en/map/")).toBe("en");
    expect(localeFromPathname("/es/mapa/")).toBe("es");
    expect(localeFromPathname("/entrate/")).toBe("it");
  });

  it("maps a page to the same page in another language", () => {
    expect(equivalentPath("/", "en")).toBe("/en/");
    expect(equivalentPath("/mappa/", "es")).toBe("/es/mapa/");
    expect(equivalentPath("/prezzo-benzina/roma/", "en")).toBe("/en/petrol-price/roma/");
    expect(equivalentPath("/es/precio-diesel/napoli/", "it")).toBe("/prezzo-diesel/napoli/");
  });

  it("falls back to the city index when a city is not translated", () => {
    expect(equivalentPath("/prezzo-gpl/bergamo/", "en")).toBe("/en/fuel-prices/");
    expect(cityFuelAlternates("BENZINA", "bergamo")).toBeUndefined();
  });

  it("uses foreign city names", () => {
    expect(localizedCityName("en", { slug: "firenze", name: "Firenze" })).toBe("Florence");
    expect(localizedCityName("es", { slug: "firenze", name: "Firenze" })).toBe("Florencia");
    expect(localizedCityName("it", { slug: "firenze", name: "Firenze" })).toBe("Firenze");
  });
});
