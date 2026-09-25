"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CityFuelStatistic, PriceHistoryPoint } from "@/types/statistics";

interface PriceHistoryChartProps {
  points: PriceHistoryPoint[];
  fallbackStatistic?: CityFuelStatistic;
}

const ranges = ["1 mese", "3 mesi", "1 anno", "5 anni", "Tutto"];

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildFallbackHistory(statistic: CityFuelStatistic): PriceHistoryPoint[] {
  const updatedAt = new Date(statistic.updatedAt);
  const endDate = Number.isNaN(updatedAt.getTime()) ? new Date() : updatedAt;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (6 - index));

    return {
      date: formatDate(date),
      averagePrice: statistic.averagePrice,
      minimumPrice: statistic.minimumPrice,
      maximumPrice: statistic.maximumPrice
    };
  });
}

export function PriceHistoryChart({ points, fallbackStatistic }: PriceHistoryChartProps) {
  const chartPoints = points.length > 1 ? points : fallbackStatistic ? buildFallbackHistory(fallbackStatistic) : points;
  const isFallback = points.length <= 1 && Boolean(fallbackStatistic);

  return (
    <section aria-labelledby="storico" className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="storico" className="text-xl font-black text-ink">
            Storico prezzi
          </h2>
          <p className="text-sm text-ink/62">Media, minimo e massimo. Il portafoglio apprezza la memoria storica.</p>
        </div>
        <div className="flex flex-wrap gap-1" aria-label="Intervallo storico">
          {ranges.map((range, index) => (
            <button
              key={range}
              type="button"
              className={`rounded-md border px-2 py-1 text-xs font-bold ${
                index === 1 ? "border-petrol bg-petrol text-white" : "border-ink/10 bg-white text-ink/70"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      {isFallback ? (
        <p className="mt-3 rounded-md bg-amber/15 p-3 text-sm font-bold text-ink/70">
          Lo storico dettagliato e in fase di completamento: per ora mostriamo il dato corrente come riferimento grafico.
        </p>
      ) : null}
      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartPoints} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value: string) => value.slice(5)} />
            <YAxis domain={["dataMin - 0.02", "dataMax + 0.02"]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => `${value.toFixed(3)} euro`} labelFormatter={(label) => `Data ${label}`} />
            <Line type="monotone" dataKey="averagePrice" name="Media" stroke="#165a67" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="minimumPrice" name="Minimo" stroke="#1f9d68" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="maximumPrice" name="Massimo" stroke="#cf3e37" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
