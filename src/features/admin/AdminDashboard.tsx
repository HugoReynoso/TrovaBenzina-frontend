"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { approvePriceReport, rejectPriceReport } from "@/lib/api/reports";
import { formatEuro } from "@/lib/price";
import type { AdminLogEntry, PriceReport, PriceReportStatus } from "@/types/report";

interface AdminDashboardProps {
  initialReports: PriceReport[];
  logs: AdminLogEntry[];
  token: string;
  loading: boolean;
  onReportsChange: (reports: PriceReport[]) => void;
  onLogout: () => void;
}

const statusLabels: Record<PriceReportStatus, string> = {
  pending: "In attesa",
  approved: "Approvata",
  rejected: "Rifiutata"
};

const levelClass: Record<AdminLogEntry["level"], string> = {
  info: "bg-petrol/10 text-petrol",
  warning: "bg-amber/15 text-amber",
  error: "bg-tomato/10 text-tomato"
};

export function AdminDashboard({ initialReports, logs, token, loading, onReportsChange, onLogout }: AdminDashboardProps) {
  const [reports, setReports] = useState(initialReports);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const pendingCount = useMemo(() => reports.filter((report) => report.status === "pending").length, [reports]);

  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  async function updateStatus(id: number, status: PriceReportStatus) {
    setUpdatingId(id);
    setError("");

    try {
      const updatedReport = status === "approved" ? await approvePriceReport(id, token) : await rejectPriceReport(id, token);
      const nextReports = reports.map((report) => (report.id === id ? updatedReport : report));
      setReports(nextReports);
      onReportsChange(nextReports);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Aggiornamento segnalazione non riuscito.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-black text-petrol">
              <ShieldCheck size={18} aria-hidden="true" />
              Area admin
            </p>
            <h1 className="mt-1 text-2xl font-black text-ink md:text-4xl">Approvazione segnalazioni</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-amber/15 px-3 py-2 text-sm font-black text-amber">{pendingCount} in attesa</span>
            <button className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-black text-ink/70" type="button" onClick={onLogout}>
              Esci
            </button>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-ink/68">
          Le segnalazioni degli utenti non pubblicano prezzi finche non vengono approvate.
        </p>
        {loading ? <p className="mt-3 rounded-md bg-ink/[0.035] p-3 text-sm font-bold text-ink/64">Caricamento dati admin...</p> : null}
        {error ? <p className="mt-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}
      </section>

      <section className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm" aria-labelledby="admin-reports">
        <div className="border-b border-ink/10 p-4">
          <h2 id="admin-reports" className="text-xl font-black text-ink">
            Segnalazioni prezzi
          </h2>
        </div>
        <div className="grid divide-y divide-ink/10">
          {reports.length > 0 ? reports.map((report) => (
            <article key={report.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black text-ink">
                    {report.brand} - {report.stationName}
                  </p>
                  <span className="rounded-md bg-ink/[0.06] px-2 py-1 text-xs font-black text-ink/70">{statusLabels[report.status]}</span>
                </div>
                <p className="mt-1 text-sm text-ink/64">
                  {report.cityName} · {report.fuelTypeCode} · {report.selfService ? "Self" : "Servito"} · {formatEuro(report.price)}
                </p>
                {report.note ? <p className="mt-2 text-sm text-ink/70">{report.note}</p> : null}
                <p className="mt-2 text-xs text-ink/52">
                  Inviata il {new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" }).format(new Date(report.submittedAt))}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:w-48">
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-mint px-3 text-sm font-black text-white disabled:opacity-45"
                  type="button"
                  disabled={report.status === "approved" || updatingId === report.id}
                  onClick={() => updateStatus(report.id, "approved")}
                >
                  <Check size={16} aria-hidden="true" />
                  Approva
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-tomato px-3 text-sm font-black text-white disabled:opacity-45"
                  type="button"
                  disabled={report.status === "rejected" || updatingId === report.id}
                  onClick={() => updateStatus(report.id, "rejected")}
                >
                  <X size={16} aria-hidden="true" />
                  Rifiuta
                </button>
              </div>
            </article>
          )) : (
            <p className="p-4 text-sm font-bold text-ink/60">Nessuna segnalazione prezzo trovata.</p>
          )}
        </div>
      </section>

      <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" aria-labelledby="admin-logs">
        <h2 id="admin-logs" className="text-xl font-black text-ink">
          Log e bug
        </h2>
        <div className="mt-4 grid gap-3">
          {logs.length > 0 ? logs.map((log) => (
            <article key={log.id} className="rounded-md bg-ink/[0.035] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md px-2 py-1 text-xs font-black ${levelClass[log.level]}`}>{log.level.toUpperCase()}</span>
                <span className="text-xs font-black uppercase tracking-[0.08em] text-ink/54">{log.area}</span>
              </div>
              <p className="mt-2 text-sm text-ink/74">{log.message}</p>
              <p className="mt-2 text-xs text-ink/48">
                {new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" }).format(new Date(log.createdAt))}
              </p>
            </article>
          )) : (
            <p className="rounded-md bg-ink/[0.035] p-3 text-sm font-bold text-ink/60">Nessun log disponibile.</p>
          )}
        </div>
      </section>
    </div>
  );
}
