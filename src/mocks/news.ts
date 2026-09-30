import type { NewsArticle } from "@/types/news";

// Nel campo "content" le righe che iniziano con "## " diventano sottotitoli (H2) nella pagina dell'articolo.
export const mockNews: NewsArticle[] = [
  {
    title: "Come risparmiare sul pieno: 10 consigli pratici",
    slug: "come-risparmiare-carburante",
    excerpt: "Dove, quando e come fare rifornimento per spendere meno su benzina, diesel e GPL, più le abitudini di guida che riducono i consumi.",
    date: "2026-09-29",
    category: "Risparmio",
    image: "/news/risparmio-carburante.svg",
    content: [
      "Il prezzo del carburante può cambiare di parecchi centesimi al litro tra distributori della stessa zona. Su un pieno di 50 litri, 20 centesimi di differenza valgono 10 euro: scegliere bene dove fermarsi è il modo più semplice per risparmiare. Ecco i consigli che fanno davvero la differenza.",
      "## 1. Confronta i prezzi prima di partire",
      "Controlla la mappa dei distributori della tua zona e ordina per prezzo. Su TrovaBenzina le classifiche mostrano solo prezzi comunicati negli ultimi 4 giorni, così eviti di arrivare alla pompa e trovare un prezzo diverso.",
      "## 2. Preferisci il self service",
      "A parità di distributore, il self costa quasi sempre meno del servito. Se devi fare il pieno di sera o nel weekend, il self è spesso l'unica modalità disponibile e anche la più conveniente.",
      "## 3. Valuta le pompe bianche",
      "I distributori indipendenti, senza il marchio delle grandi compagnie, hanno spesso prezzi più bassi. Il carburante deve comunque rispettare le stesse norme di qualità: la differenza è soprattutto nei costi del marchio e dei servizi.",
      "## 4. Evita di fare rifornimento in autostrada",
      "Le aree di servizio autostradali hanno in genere prezzi più alti rispetto alla viabilità ordinaria. Se puoi, fai il pieno prima di entrare in autostrada o in un distributore vicino a un'uscita.",
      "## 5. Guarda la data del prezzo",
      "Un prezzo molto basso ma comunicato settimane fa potrebbe non essere più valido. Controlla sempre la data dell'ultima comunicazione, che trovi nella scheda di ogni distributore.",
      "## 6. Controlla la pressione degli pneumatici",
      "Gomme sgonfie aumentano la resistenza al rotolamento e quindi i consumi. Controlla la pressione almeno una volta al mese, a gomme fredde, con i valori indicati dal costruttore.",
      "## 7. Guida in modo fluido",
      "Accelerazioni brusche e frenate improvvise fanno salire i consumi. Mantenere una velocità costante, anticipare le frenate e usare marce alte quando possibile riduce il carburante consumato.",
      "## 8. Togli il peso inutile",
      "Portapacchi vuoti, box sul tetto e carichi dimenticati nel bagagliaio aumentano peso e resistenza all'aria. Rimuovili quando non servono.",
      "## 9. Usa il climatizzatore con criterio",
      "Il climatizzatore aumenta i consumi, soprattutto nei tragitti brevi. In città a bassa velocità può convenire aprire i finestrini; ad alta velocità, invece, i finestrini aperti peggiorano l'aerodinamica.",
      "## 10. Approfitta delle carte fedeltà",
      "Molte compagnie offrono sconti o punti con le loro app e carte fedeltà. Confronta però sempre il prezzo finale: uno sconto su un prezzo di partenza più alto può non essere conveniente."
    ],
    relatedLinks: [
      {
        href: "/prezzi-carburanti",
        label: "Prezzi carburanti per città",
        description: "Trova il capoluogo più vicino e confronta i distributori della provincia."
      },
      {
        href: "/notizie/pompe-bianche-cosa-sono",
        label: "Pompe bianche: cosa sono",
        description: "Perché i distributori senza marchio costano spesso meno."
      },
      {
        href: "/notizie/self-servito-differenze",
        label: "Self o servito",
        description: "Quando conviene il self e come confrontare prezzi omogenei."
      }
    ]
  },
  {
    title: "Pompe bianche: cosa sono e perché costano meno",
    slug: "pompe-bianche-cosa-sono",
    excerpt: "I distributori indipendenti hanno spesso prezzi più bassi dei marchi noti. Ecco da dove nasce la differenza e cosa sapere sulla qualità del carburante.",
    date: "2026-09-29",
    category: "Guide",
    image: "/news/pompe-bianche.svg",
    content: [
      "Si chiamano \"pompe bianche\" i distributori di carburante indipendenti, che non espongono il marchio delle grandi compagnie petrolifere. Possono essere gestiti da piccole aziende locali, da reti indipendenti o dalla grande distribuzione, come i distributori vicino ai supermercati.",
      "## Perché costano meno",
      "Un distributore con un marchio noto sostiene costi legati al marchio stesso: accordi con la compagnia, programmi fedeltà, pubblicità, standard di immagine e servizi aggiuntivi. Le pompe bianche acquistano il carburante sul mercato all'ingrosso e hanno una struttura più snella, che spesso si traduce in qualche centesimo in meno al litro.",
      "## Il carburante è di qualità inferiore?",
      "No. Benzina e gasolio venduti in Italia devono rispettare le stesse specifiche tecniche europee, qualunque sia il marchio del distributore. Le differenze possono riguardare i carburanti \"premium\" con additivi specifici, che alcune compagnie vendono a un prezzo più alto, ma il carburante standard deve avere le stesse caratteristiche minime.",
      "## Come trovarle",
      "Sulla mappa di TrovaBenzina ogni distributore mostra il suo marchio: gli impianti indipendenti compaiono con il nome del gestore o con un'icona generica. Ordinando i distributori per prezzo, le pompe bianche della tua zona finiscono spesso tra i primi posti.",
      "## Cosa controllare",
      "Come per qualunque distributore, verifica la data dell'ultimo prezzo comunicato e la modalità (self o servito). Alcuni impianti indipendenti sono solo self service o hanno orari ridotti: controlla prima di fare deviazioni lunghe."
    ],
    relatedLinks: [
      {
        href: "/mappa",
        label: "Mappa dei distributori",
        description: "Confronta marchi e pompe bianche nella tua zona."
      },
      {
        href: "/notizie/come-risparmiare-carburante",
        label: "Come risparmiare sul pieno",
        description: "10 consigli pratici per spendere meno a ogni rifornimento."
      },
      {
        href: "/notizie/perche-prezzi-carburanti-cambiano",
        label: "Perché i prezzi cambiano",
        description: "Le ragioni delle differenze tra distributori vicini."
      }
    ]
  },
  {
    title: "Come leggere i prezzi su TrovaBenzina",
    slug: "come-leggere-prezzi-trovabenzina",
    excerpt: "Da dove arrivano i prezzi, cosa significa la data di comunicazione e perché alcuni distributori non compaiono nelle classifiche.",
    date: "2026-09-29",
    category: "Guide",
    image: "/news/come-leggere-prezzi.svg",
    content: [
      "TrovaBenzina mostra i prezzi di benzina, diesel e GPL dei distributori italiani. Per usarli al meglio è utile sapere da dove arrivano e come li trattiamo.",
      "## Da dove arrivano i prezzi",
      "I gestori degli impianti sono tenuti a comunicare i prezzi praticati al Ministero delle Imprese e del Made in Italy (MIMIT), che li pubblica come dati aperti. TrovaBenzina raccoglie questi dati ogni giorno e li mostra sulla mappa e nelle classifiche.",
      "## La data di comunicazione",
      "Ogni prezzo ha una data: è il momento in cui il gestore lo ha comunicato. Un prezzo recente è più affidabile; uno comunicato molto tempo fa potrebbe non essere più quello esposto alla pompa. Per questo nella scheda di ogni distributore trovi sempre la data dell'aggiornamento.",
      "## Perché alcuni distributori non sono in classifica",
      "Nelle classifiche dei più economici mostriamo solo i prezzi comunicati negli ultimi 4 giorni. Escludiamo anche i prezzi palesemente sbagliati, per esempio 1,000 € o 0,100 € al litro, che nascono da errori di inserimento. Sulla mappa, invece, trovi tutti i distributori con l'ultimo prezzo disponibile.",
      "## Self, servito e miglior prezzo",
      "Puoi scegliere se confrontare i prezzi self service, quelli con servizio o il miglior prezzo disponibile in ciascun distributore. Per un confronto corretto conviene sempre paragonare la stessa modalità: il self costa quasi sempre meno.",
      "## Se trovi un prezzo diverso",
      "Se alla pompa il prezzo è diverso da quello mostrato, puoi segnalarlo dalla pagina \"Segnala un prezzo\": ci aiuti a tenere i dati aggiornati per tutti."
    ],
    relatedLinks: [
      {
        href: "/segnala-prezzo",
        label: "Segnala un prezzo",
        description: "Hai trovato un prezzo diverso alla pompa? Faccelo sapere."
      },
      {
        href: "/mappa",
        label: "Mappa dei distributori",
        description: "Tutti i distributori con l'ultimo prezzo disponibile."
      },
      {
        href: "/prezzi-carburanti",
        label: "Prezzi carburanti per città",
        description: "Classifiche dei più economici in ogni capoluogo."
      }
    ]
  },
  {
    title: "Prezzi carburanti: perché cambiano anche nella stessa città",
    slug: "perche-prezzi-carburanti-cambiano",
    excerpt: "Costi logistici, marchio, concorrenza locale e modalità self o servito spiegano differenze di prezzo anche tra distributori a pochi chilometri.",
    date: "2026-09-29",
    category: "Guide",
    image: "/news/prezzi-carburanti.svg",
    content: [
      "Capita spesso di vedere due distributori nella stessa via con prezzi diversi di diversi centesimi al litro. Non è un errore: il prezzo alla pompa dipende da molti fattori, alcuni uguali per tutti e altri che cambiano da impianto a impianto.",
      "## Cosa è uguale per tutti",
      "Una parte importante del prezzo è composta da tasse: l'accisa, un importo fisso per litro stabilito dallo Stato, e l'IVA. Anche il costo della materia prima segue le quotazioni internazionali dei prodotti raffinati e il cambio tra euro e dollaro, che valgono per tutti i distributori.",
      "## Cosa cambia da distributore a distributore",
      "Il resto del prezzo dipende dalle scelte e dai costi di ciascun impianto: il marchio e gli accordi con la compagnia petrolifera, i costi di trasporto e di gestione, i servizi offerti (bar, officina, lavaggio) e il margine del gestore. Anche la posizione conta: in autostrada e nelle zone con poca concorrenza i prezzi tendono a essere più alti.",
      "## Self e servito",
      "Lo stesso distributore può avere due prezzi diversi per lo stesso carburante: self service e servito. La differenza paga il personale che fa rifornimento al posto tuo e può essere significativa.",
      "## I tempi di aggiornamento",
      "I prezzi cambiano anche nel tempo. Quando le quotazioni internazionali salgono o scendono, non tutti i distributori aggiornano i listini nello stesso momento. Per questo TrovaBenzina mostra sempre la data dell'ultima comunicazione del prezzo: così capisci quanto è recente l'informazione.",
      "## Come approfittarne",
      "Proprio perché le differenze sono reali, confrontare prima di fare rifornimento conviene. Usa la mappa per vedere i distributori vicini a te ordinati per prezzo e scegli quello più conveniente sul tuo percorso."
    ],
    relatedLinks: [
      {
        href: "/prezzo-benzina/milano",
        label: "Prezzo benzina a Milano",
        description: "Confronta i distributori della provincia e trova il pieno più conveniente."
      },
      {
        href: "/prezzo-diesel/roma",
        label: "Prezzo diesel a Roma",
        description: "Guarda le differenze tra self e servito nella tua zona."
      },
      {
        href: "/notizie/self-servito-differenze",
        label: "Self o servito",
        description: "Capire la modalità giusta aiuta a confrontare prezzi omogenei."
      }
    ]
  },
  {
    title: "Self o servito: cosa controllare prima di fare il pieno",
    slug: "self-servito-differenze",
    excerpt: "La differenza di prezzo tra self e servito non è sempre piccola: ecco quando conviene l'una o l'altra modalità e come confrontare i prezzi correttamente.",
    date: "2026-09-29",
    category: "Risparmio",
    image: "/news/self-servito.svg",
    content: [
      "Quasi tutti i distributori italiani offrono due modalità di rifornimento: il self service, in cui fai tutto da solo, e il servito, in cui un addetto fa il pieno per te. Il carburante è lo stesso, ma il prezzo no.",
      "## Quanto si risparmia con il self",
      "Il servito costa di più perché include il costo del personale. La differenza varia da impianto a impianto e può arrivare a diversi centesimi al litro: su un pieno completo diventa una cifra che si nota.",
      "## Quando il servito può avere senso",
      "Il servito può essere utile se hai difficoltà a fare rifornimento da solo, se vuoi un controllo di olio o pressione delle gomme, o se il distributore è l'unico disponibile sul tuo percorso. In alcuni impianti la differenza di prezzo è minima: controllarla non costa nulla.",
      "## Confronta sempre prezzi omogenei",
      "Per capire quale distributore conviene davvero è fondamentale confrontare la stessa modalità: benzina self con benzina self, diesel servito con diesel servito. Su TrovaBenzina puoi scegliere il filtro \"Self\", \"Servito\" oppure \"Miglior prezzo\", che mostra per ogni distributore la modalità più economica.",
      "## E il GPL?",
      "Per il GPL la situazione è diversa: in molti impianti il rifornimento è solo servito, anche se sono sempre più diffuse le colonnine self. Per questo, per il GPL, TrovaBenzina usa di default la modalità servito."
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
        description: "Per il GPL la modalità disponibile può cambiare molto da impianto a impianto."
      },
      {
        href: "/notizie/come-risparmiare-carburante",
        label: "Come risparmiare sul pieno",
        description: "10 consigli pratici per spendere meno a ogni rifornimento."
      }
    ]
  },
  {
    title: "Accise e IVA: com'è composto il prezzo alla pompa",
    slug: "accise-iva-prezzo-pompa",
    excerpt: "Una panoramica semplice delle voci che formano il prezzo finale di benzina e diesel: costo del prodotto, margini, accise e IVA.",
    date: "2026-09-29",
    category: "Accise",
    image: "/news/accise-iva.svg",
    content: [
      "Quando paghi un litro di benzina o di diesel, solo una parte del prezzo va a chi produce e vende il carburante. Il resto sono tasse. Capire come si compone il prezzo aiuta a leggere meglio le variazioni che vedi alla pompa.",
      "## Le voci del prezzo",
      "Il prezzo alla pompa si può dividere in quattro parti: il costo del prodotto raffinato, legato alle quotazioni internazionali; i costi di trasporto, stoccaggio e distribuzione; il margine di compagnie e gestori; le imposte, cioè accise e IVA.",
      "## Le accise",
      "L'accisa è un'imposta fissa per litro stabilita dallo Stato: dal 1° gennaio 2026 è la stessa per benzina e gasolio (0,6729 € al litro, salvo tagli temporanei) ed è molto più bassa per GPL e metano. Essendo un importo fisso, non cambia quando cambia il prezzo del petrolio: per questo, quando le quotazioni scendono, il prezzo alla pompa cala in proporzione meno di quanto ci si aspetterebbe.",
      "## L'IVA",
      "Sul carburante si applica l'IVA ordinaria del 22%. L'IVA si calcola sul prezzo che comprende già l'accisa: di fatto, si paga l'IVA anche sull'accisa.",
      "## Perché il peso delle tasse è così alto",
      "Sommando accise e IVA, le imposte rappresentano una quota molto rilevante del prezzo finale, spesso più della metà. Le variazioni che vedi da un giorno all'altro, invece, dipendono soprattutto dal costo del prodotto e dai margini.",
      "## Dove approfondire",
      "Nella guida alle accise trovi un grafico con la composizione del prezzo. Per i valori ufficiali e aggiornati delle aliquote fa fede il sito del Ministero dell'Economia e dell'Agenzia delle Dogane e dei Monopoli."
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
        href: "/notizie/perche-prezzi-carburanti-cambiano",
        label: "Perché i prezzi cambiano",
        description: "Cosa è uguale per tutti e cosa cambia da distributore a distributore."
      }
    ]
  }
];
