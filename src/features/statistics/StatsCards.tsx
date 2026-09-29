import { Gauge, TrendingDown, TrendingUp, Warehouse } from "lucide-react";
import { intlLocale, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { formatEuro } from "@/lib/price";
import type { CityFuelStatistic } from "@/types/statistics";

interface StatsCardsProps {
  statistic: CityFuelStatistic;
  compact?: boolean;
  locale?: Locale;
}

const statClass = "rounded-md border border-ink/10 bg-white p-4 shadow-sm";

export function StatsCards({ statistic, compact = false, locale = "it" }: StatsCardsProps) {
  const t = getMessages(locale);
  const intl = intlLocale(locale);
  const items = [
    { label: t.stats.average, value: formatEuro(statistic.averagePrice, intl), icon: Gauge },
    { label: t.stats.minimum, value: formatEuro(statistic.minimumPrice, intl), icon: TrendingDown },
    { label: t.stats.maximum, value: formatEuro(statistic.maximumPrice, intl), icon: TrendingUp },
    { label: t.stats.stations, value: String(statistic.stationCount), icon: Warehouse }
  ];

  return (
    <section aria-labelledby="statistiche" className="grid gap-3">
      <h2 id="statistiche" className="text-xl font-black text-ink">
        {t.stats.title}
      </h2>
      <div className={`grid grid-cols-2 gap-3 ${compact ? "" : "md:grid-cols-4"}`}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article className={statClass} key={item.label}>
              <Icon className="mb-3 text-petrol" size={20} aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink/56">{item.label}</p>
              <p className="mt-1 text-xl font-black text-ink">{item.value}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
