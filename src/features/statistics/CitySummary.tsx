import type { City } from "@/types/location";
import type { CityFuelStatistic } from "@/types/statistics";
import { intlLocale, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { formatEuro } from "@/lib/price";
import { typicalPrice } from "@/lib/statistics";

interface CitySummaryProps {
  city: City;
  statistic: CityFuelStatistic;
  provinceName?: string;
  locale?: Locale;
}

export function CitySummary({ city, statistic, provinceName, locale = "it" }: CitySummaryProps) {
  const t = getMessages(locale);
  const intl = intlLocale(locale);
  const areaName = provinceName ?? city.name;

  return (
    <section className="rounded-md border border-ink/10 bg-white p-4 leading-relaxed text-ink/72 shadow-sm">
      <h2 className="text-xl font-black text-ink">{t.citySummary.title(areaName)}</h2>
      <p className="mt-2 max-w-4xl">
        {t.citySummary.text(
          areaName,
          formatEuro(typicalPrice(statistic), intl),
          formatEuro(statistic.minimumPrice, intl),
          formatEuro(statistic.maximumPrice, intl),
          statistic.stationCount
        )}
      </p>
      <p className="mt-2 max-w-4xl text-sm">{t.citySummary.note}</p>
    </section>
  );
}
