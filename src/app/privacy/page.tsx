import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import Link from "next/link";
import { founder } from "@/lib/seo";

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
          TrovaBenzina e in fase di sviluppo. Le segnalazioni inviate dagli utenti vengono pubblicate solo dopo approvazione.
        </p>
        <section className="grid gap-2">
          <h2 className="text-xl font-black text-ink">Dati trattati</h2>
          <p>
            Il form di segnalazione prezzo può raccogliere prezzo, distributore, carburante, modalità self o servito, note e,
            solo se forniti volontariamente, nome ed email.
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-black text-ink">Geolocalizzazione</h2>
          <p>
            La posizione viene richiesta dal browser per mostrarti sulla mappa e cercare i distributori nelle vicinanze.
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-black text-ink">Contatti</h2>
          <p>
            Per domande sui dati o per chiederne la cancellazione scrivi a{" "}
            <a className="font-black text-petrol hover:underline" href={`mailto:${founder.email}`}>
              {founder.email}
            </a>
            . Altre informazioni nella pagina{" "}
            <Link className="font-black text-petrol hover:underline" href="/chi-siamo">
              Chi siamo e contatti
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
