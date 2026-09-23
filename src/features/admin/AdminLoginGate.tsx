"use client";

import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";
import { loginAdmin } from "@/lib/api/auth";
import { getAdminLogs, getPriceReports } from "@/lib/api/reports";
import type { AdminLogEntry, PriceReport } from "@/types/report";

const TOKEN_STORAGE_KEY = "trovabenzina-admin-token";

export function AdminLoginGate() {
  const [token, setToken] = useState<string | null>(null);
  const [reports, setReports] = useState<PriceReport[]>([]);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);

    if (savedToken) {
      setToken(savedToken);
      void loadAdminData(savedToken);
    }
  }, []);

  async function loadAdminData(nextToken: string) {
    setIsLoading(true);
    setError("");

    try {
      const [nextReports, nextLogs] = await Promise.all([getPriceReports(nextToken), getAdminLogs(nextToken)]);
      setReports(nextReports);
      setLogs(nextLogs);
    } catch (loadError) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setError(loadError instanceof Error ? loadError.message : "Impossibile caricare i dati admin.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const nextToken = await loginAdmin(email.trim().toLowerCase(), password);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      setToken(nextToken);
      await loadAdminData(nextToken);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Credenziali non valide.");
    } finally {
      setIsLoading(false);
    }
  }

  if (token) {
    return (
      <AdminDashboard
        initialReports={reports}
        logs={logs}
        token={token}
        loading={isLoading}
        onReportsChange={setReports}
        onLogout={() => {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
          setReports([]);
          setLogs([]);
        }}
      />
    );
  }

  return (
    <section className="mx-auto max-w-md rounded-md border border-ink/10 bg-white p-5 shadow-sm md:p-6" aria-labelledby="admin-login">
      <div className="grid gap-2">
        <span className="grid size-11 place-items-center rounded-md bg-petrol text-white">
          <LockKeyhole size={22} aria-hidden="true" />
        </span>
        <h1 id="admin-login" className="text-2xl font-black text-ink">
          Login admin
        </h1>
        <p className="text-sm text-ink/66">Area riservata per approvare segnalazioni e controllare log.</p>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-black text-ink">Email</span>
          <input
            className="h-12 rounded-md border border-ink/10 px-3"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-ink">Password</span>
          <input
            className="h-12 rounded-md border border-ink/10 px-3"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}
        <button className="h-12 rounded-md bg-petrol px-5 font-black text-white disabled:opacity-60" type="submit" disabled={isLoading}>
          {isLoading ? "Accesso..." : "Entra"}
        </button>
      </form>

      <p className="mt-5 rounded-md bg-ink/[0.035] p-3 text-xs text-ink/62">
        Credenziali locali: admin@trovabenzina.it / trova-admin. La sessione usa il token JWT restituito dal backend.
      </p>
    </section>
  );
}
