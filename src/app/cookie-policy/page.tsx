import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Informativa cookie di TrovaBenzina.",
  alternates: { canonical: "/cookie-policy" }
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-3xl gap-5 px-4 py-8 leading-relaxed text-ink/76 md:px-6">
        <h1 className="text-3xl font-black text-ink">Cookie Policy</h1>
        <p>
          In questa V1 TrovaBenzina non usa cookie di profilazione, advertising o analytics di terze parti. Per questo non viene
          mostrato un banner consenso.
        </p>
        <section className="grid gap-2">
          <h2 className="text-xl font-black text-ink">Strumenti tecnici</h2>
          <p>
            Il sito puo usare strumenti tecnici del browser, come session storage per la demo dell&apos;area admin e parametri URL per la
            lingua selezionata. Sono funzionali all&apos;uso del sito e non servono a profilare l&apos;utente.
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-black text-ink">Quando servira un banner</h2>
          <p>
            Se in futuro verranno aggiunti analytics non anonimizzati, pubblicita, remarketing o altri strumenti di tracciamento non
            tecnici, andra introdotto un banner consenso con gestione granulare delle preferenze.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
