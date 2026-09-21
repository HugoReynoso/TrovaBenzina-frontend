"use client";

import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";
import type { AdminLogEntry, PriceReport } from "@/types/report";

interface AdminLoginGateProps {
  reports: PriceReport[];
  logs: AdminLogEntry[];
}

const DEMO_EMAIL = "admin@trovabenzina.it";
const DEMO_PASSWORD = "trova-admin";

export function AdminLoginGate({ reports, logs }: AdminLoginGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setIsAuthenticated(sessionStorage.getItem("trovabenzina-admin") === "ok");
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError("Credenziali non valide per questa demo.");
      return;
    }

    sessionStorage.setItem("trovabenzina-admin", "ok");
    setIsAuthenticated(true);
  }

  if (isAuthenticated) {
    return <AdminDashboard initialReports={reports} logs={logs} />;
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
        <button className="h-12 rounded-md bg-petrol px-5 font-black text-white" type="submit">
          Entra
        </button>
      </form>

      <p className="mt-5 rounded-md bg-ink/[0.035] p-3 text-xs text-ink/62">
        Demo V1: {DEMO_EMAIL} / {DEMO_PASSWORD}. In produzione servira autenticazione backend, sessioni sicure e ruoli.
      </p>
    </section>
  );
}
