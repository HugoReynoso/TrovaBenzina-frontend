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
    ],
    relatedLinks: [
      {
        href: "/prezzo-benzina/milano",
        label: "Prezzo benzina a Milano",
        description: "Confronta i distributori della provincia e trova il pieno piu conveniente."
      },
      {
        href: "/prezzo-diesel/roma",
        label: "Prezzo diesel a Roma",
        description: "Guarda differenze tra self e servito nella ricerca carburante."
      },
      {
        href: "/notizie/self-servito-differenze",
        label: "Self o servito",
        description: "Capire la modalita giusta aiuta a confrontare prezzi omogenei."
      }
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
    ],
    relatedLinks: [
      {
        href: "/prezzo-benzina/torino",
        label: "Prezzo benzina a Torino",
        description: "Usa i filtri per confrontare le stazioni self nella zona."
      },
      {
        href: "/prezzo-gpl/milano",
        label: "Prezzo GPL a Milano",
        description: "Per GPL e metano la modalita disponibile puo cambiare molto da impianto a impianto."
      },
      {
        href: "/notizie/perche-prezzi-carburanti-cambiano",
        label: "Perche i prezzi cambiano",
        description: "Le differenze tra distributori vicini non dipendono solo dalla distanza."
      }
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
    ],
    relatedLinks: [
      {
        href: "/accise-benzina",
        label: "Guida accise benzina",
        description: "Approfondisci il peso di accise e IVA sul prezzo finale."
      },
      {
        href: "/prezzo-benzina/roma",
        label: "Prezzo benzina a Roma",
        description: "Confronta il prezzo alla pompa nella tua area."
      },
      {
        href: "/notizie/self-servito-differenze",
        label: "Self o servito",
        description: "La modalita incide sul prezzo che paghi davvero."
      }
    ]
  }
];
