import type { NewsArticle } from "@/types/news";

export const mockNews: NewsArticle[] = [
  {
    title: "Prezzi carburanti: perche cambiano anche nella stessa citta",
    slug: "perche-prezzi-carburanti-cambiano",
    excerpt: "Costi logistici, aggiornamenti MIMIT e modalita self o servito spiegano differenze anche a pochi chilometri.",
    date: "2026-09-18",
    category: "Guide",
    image: "/news/prezzi-carburanti.svg",
    content: [
      "I prezzi dei carburanti possono variare tra distributori vicini per politiche commerciali, costi operativi e tempi di aggiornamento.",
      "TrovaBenzina mostrera sempre la data di comunicazione del prezzo, cosi puoi capire quanto e recente l'informazione."
    ]
  },
  {
    title: "Self o servito: cosa controllare prima di fare pieno",
    slug: "self-servito-differenze",
    excerpt: "La differenza di prezzo non e sempre piccola: il filtro giusto evita sorprese al momento del rifornimento.",
    date: "2026-09-15",
    category: "Risparmio",
    image: "/news/self-servito.svg",
    content: [
      "La modalita self service di solito costa meno del servito, ma non tutti i distributori offrono entrambe le opzioni.",
      "Confrontare prezzi omogenei e fondamentale: benzina self con benzina self, diesel servito con diesel servito."
    ]
  },
  {
    title: "Accise e IVA: com'e composto il prezzo alla pompa",
    slug: "accise-iva-prezzo-pompa",
    excerpt: "Una panoramica semplice delle voci principali che formano il prezzo finale pagato dall'automobilista.",
    date: "2026-09-10",
    category: "Accise",
    image: "/news/accise-iva.svg",
    content: [
      "Il prezzo finale include materia prima, distribuzione, margini, accise e IVA.",
      "I valori di dettaglio richiedono fonti aggiornate e verificate: questa sezione e gia pronta per dati ufficiali."
    ]
  }
];
