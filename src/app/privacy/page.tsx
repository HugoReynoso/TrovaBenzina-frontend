import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa privacy di TrovaBenzina per navigazione, segnalazioni prezzo e area admin.",
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-3xl gap-5 px-4 py-8 leading-relaxed text-ink/76 md:px-6">
        <h1 className="text-3xl font-black text-ink">Privacy Policy</h1>
        <p>
          TrovaBenzina e in fase di sviluppo. In questa V1 il sito usa il backend locale e non pubblica segnalazioni inviate dagli utenti
          senza approvazione admin.
        </p>
        <section className="grid gap-2">
          <h2 className="text-xl font-black text-ink">Dati trattati</h2>
          <p>
            Il form di segnalazione prezzo puo raccogliere prezzo, distributore, carburante, modalita self o servito, note e,
            solo se forniti volontariamente, nome ed email.
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-black text-ink">Geolocalizzazione</h2>
          <p>
            La posizione viene richiesta dal browser per mostrarti sulla mappa. In questa V1 non viene salvata nel backend.
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-black text-ink">Contatti</h2>
          <p>Pagina contatti futura. Prima della produzione andra completata con titolare, email e dettagli legali.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
