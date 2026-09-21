import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FuelComposition } from "@/features/statistics/FuelComposition";

export const metadata: Metadata = {
  title: "Accise Benzina - Composizione del Prezzo",
  description: "Scopri come e composto il prezzo della benzina tra materia prima, distribuzione, accise e IVA.",
  alternates: { canonical: "/accise-benzina" }
};

export default function AccisePage() {
  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <h1 className="text-3xl font-black text-ink">Accise benzina</h1>
        <p className="max-w-3xl text-ink/70">
          Questa pagina prepara la struttura informativa per dati verificati. I valori puntuali verranno collegati a fonti ufficiali.
        </p>
        <FuelComposition />
      </main>
      <Footer />
    </>
  );
}
