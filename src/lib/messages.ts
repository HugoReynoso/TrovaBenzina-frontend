import type { Locale } from "@/lib/i18n";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";

export interface Messages {
  tagline: string;
  nav: { home: string; map: string; excise: string; news: string; report: string; pricesByCity: string };
  openMenu: string;
  closeMenu: string;
  chooseLanguage: string;
  mainNavigation: string;
  mobileNavigation: string;
  /** Nome del carburante con iniziale maiuscola (es. "Benzina", "Petrol"). */
  fuelName: Record<FuelTypeCode, string>;
  /** Nome del carburante dentro una frase (es. "benzina", "petrol", "gasolina"). */
  fuelInSentence: Record<FuelTypeCode, string>;
  serviceMode: Record<ServiceMode, string>;
  serviceModeShort: Record<ServiceMode, string>;
  /** Tipo di rifornimento nella scheda del distributore. */
  priceMode: { self: string; served: string };
  filters: { province: string; fuel: string; mode: string; find: string; quick: string; filterTitle: string };
  location: {
    useMyLocation: string;
    locating: string;
    aroundYou: string;
    notSupported: string;
    denied: string;
    unavailable: string;
    locateMe: string;
    located: string;
    locateAria: string;
    locateTitle: string;
    youAreHere: string;
    kmFromYou: (km: string) => string;
  };
  home: {
    priceInProvince: (fuel: FuelTypeCode, province: string) => string;
    stationsCount: (count: number) => string;
    pricesUpdatedAt: (date: string) => string;
    noStations: string;
    removeFilters: string;
    rankingNear: string;
    rankingProvince: (province: string) => string;
    rankingSubtitle: string;
    reportPrice: string;
    loadingTitle: string;
    loadingText: string;
    loadStationsError: string;
    loadDataError: string;
    exciseAccordion: string;
  };
  cheapest: {
    empty: string;
    fallbackTitle: (city?: string) => string;
    top: (count: number) => string;
    showOnMap: string;
    directions: string;
  };
  stats: { title: string; average: string; minimum: string; maximum: string; stations: string };
  citySummary: {
    title: (area: string) => string;
    text: (area: string, average: string, minimum: string, maximum: string, count: number) => string;
    note: string;
  };
  map: {
    loading: string;
    listNear: string;
    listProvince: (province: string) => string;
    stationsBadge: (count: number) => string;
    savings: (amount: string) => string;
    emptyList: string;
    chooseFuel: string;
    chooseProvince: string;
    chooseMode: string;
    findStations: string;
    road: string;
    routeAria: (name: string) => string;
    routeTitle: string;
    updatedOn: (date: string) => string;
    updatePrice: string;
    route: string;
  };
  footer: { dataSource: string; mapData: string; pricesByCity: string; privacy: string; cookie: string; contact: string; linksLabel: string };
}

const it: Messages = {
  tagline: "Trova il pieno che fa meno male.",
  nav: { home: "Home", map: "Mappa", excise: "Accise", news: "Notizie", report: "Segnala", pricesByCity: "Prezzi per città" },
  openMenu: "Apri menu",
  closeMenu: "Chiudi menu",
  chooseLanguage: "Scegli lingua",
  mainNavigation: "Navigazione principale",
  mobileNavigation: "Navigazione mobile",
  fuelName: { BENZINA: "Benzina", DIESEL: "Diesel", GPL: "GPL", METANO: "Metano" },
  fuelInSentence: { BENZINA: "benzina", DIESEL: "diesel", GPL: "GPL", METANO: "metano" },
  serviceMode: { self: "Self service", served: "Servito", all: "Miglior prezzo" },
  serviceModeShort: { self: "Self", served: "Servito", all: "Miglior prezzo" },
  priceMode: { self: "self", served: "servito" },
  filters: { province: "Provincia", fuel: "Carburante", mode: "Modalità", find: "Trova", quick: "Veloci", filterTitle: "Filtra prezzi e distributori" },
  location: {
    useMyLocation: "Usa la mia posizione",
    locating: "Cerco...",
    aroundYou: "Intorno a te",
    notSupported: "Geolocalizzazione non disponibile su questo dispositivo.",
    denied: "Hai negato l'accesso alla posizione. Abilitalo dalle impostazioni del browser oppure scegli una provincia.",
    unavailable: "Non riesco a trovare la tua posizione in questo momento. Riprova tra qualche secondo oppure scegli una provincia.",
    locateMe: "Posizionami",
    located: "Posizione",
    locateAria: "Trova la mia posizione sulla mappa",
    locateTitle: "Trova la mia posizione",
    youAreHere: "Sei qui",
    kmFromYou: (km) => `${km} km da te`
  },
  home: {
    priceInProvince: (fuel, province) => `Prezzo ${it.fuelInSentence[fuel]} in provincia di ${province}`,
    stationsCount: (count) => `${count} distributori`,
    pricesUpdatedAt: (date) => `Prezzi aggiornati al ${date}`,
    noStations: "Nessun distributore trovato con questi filtri.",
    removeFilters: "Rimuovi filtri",
    rankingNear: "Top 5 più economici intorno a te",
    rankingProvince: (province) => `Top 5 più economici in provincia di ${province}`,
    rankingSubtitle: "Prezzi ordinati dal più conveniente",
    reportPrice: "Segnala un prezzo",
    loadingTitle: "Caricamento prezzi...",
    loadingText: "Sto aggiornando i prezzi della zona selezionata.",
    loadStationsError: "Impossibile caricare i distributori.",
    loadDataError: "Impossibile caricare i dati in questo momento.",
    exciseAccordion: "Accise e composizione prezzo"
  },
  cheapest: {
    empty: "Nessun prezzo aggiornato negli ultimi 4 giorni con questi filtri.",
    fallbackTitle: (city) => `Più economici${city ? ` (${city})` : ""}`,
    top: (count) => `Top ${count}`,
    showOnMap: "Mostra sulla mappa",
    directions: "Naviga"
  },
  stats: { title: "Prezzi in sintesi", average: "Prezzo medio", minimum: "Minimo", maximum: "Massimo", stations: "Distributori" },
  citySummary: {
    title: (area) => `Prezzi carburante in provincia di ${area}`,
    text: (area, average, minimum, maximum, count) =>
      `Nell'area di ${area}, il prezzo medio rilevato è ${average}. Il minimo è ${minimum}, il massimo è ${maximum} su ${count} distributori nel dataset corrente.`,
    note: "I dati vengono aggiornati da TrovaBenzina in base alle rilevazioni disponibili."
  },
  map: {
    loading: "Carico la mappa...",
    listNear: "Distributori vicino a te",
    listProvince: (province) => `Distributori in provincia di ${province}`,
    stationsBadge: (count) => `Distributori (${count})`,
    savings: (amount) => `Risparmio: ${amount} su un pieno di 50L`,
    emptyList: "Nessun distributore con prezzo aggiornato negli ultimi 4 giorni con questi filtri.",
    chooseFuel: "Scegli carburante",
    chooseProvince: "Scegli provincia",
    chooseMode: "Scegli modalità prezzo",
    findStations: "Trova distributori",
    road: "Stradale",
    routeAria: (name) => `Avvia il percorso per ${name} su Google Maps`,
    routeTitle: "Apri il percorso su Google Maps",
    updatedOn: (date) => `Aggiornato: ${date}`,
    updatePrice: "Aggiorna",
    route: "Percorso"
  },
  footer: {
    dataSource: "Dati prezzi provenienti da fonti ufficiali MIMIT. Gli aggiornamenti possono non essere in tempo reale.",
    mapData: "Mappe e dati cartografici: OpenStreetMap contributors.",
    pricesByCity: "Prezzi per città",
    privacy: "Privacy",
    cookie: "Cookie",
    contact: "Contatti futuri",
    linksLabel: "Link footer"
  }
};

const en: Messages = {
  tagline: "Find the fill-up that hurts the least.",
  nav: { home: "Home", map: "Map", excise: "Excise", news: "News", report: "Report", pricesByCity: "Prices by city" },
  openMenu: "Open menu",
  closeMenu: "Close menu",
  chooseLanguage: "Choose language",
  mainNavigation: "Main navigation",
  mobileNavigation: "Mobile navigation",
  fuelName: { BENZINA: "Petrol", DIESEL: "Diesel", GPL: "LPG", METANO: "CNG" },
  fuelInSentence: { BENZINA: "petrol", DIESEL: "diesel", GPL: "LPG", METANO: "CNG" },
  serviceMode: { self: "Self-service", served: "Full service", all: "Best price" },
  serviceModeShort: { self: "Self", served: "Full service", all: "Best price" },
  priceMode: { self: "self-service", served: "full service" },
  filters: { province: "Province", fuel: "Fuel", mode: "Service", find: "Search", quick: "Quick", filterTitle: "Filter prices and stations" },
  location: {
    useMyLocation: "Use my location",
    locating: "Locating...",
    aroundYou: "Near you",
    notSupported: "Geolocation is not available on this device.",
    denied: "You denied access to your location. Enable it in your browser settings or choose a province.",
    unavailable: "We can't find your location right now. Try again in a few seconds or choose a province.",
    locateMe: "Locate me",
    located: "Location",
    locateAria: "Find my location on the map",
    locateTitle: "Find my location",
    youAreHere: "You are here",
    kmFromYou: (km) => `${km} km from you`
  },
  home: {
    priceInProvince: (fuel, province) => `${en.fuelName[fuel]} prices in the province of ${province}`,
    stationsCount: (count) => `${count} stations`,
    pricesUpdatedAt: (date) => `Prices updated on ${date}`,
    noStations: "No stations found with these filters.",
    removeFilters: "Reset filters",
    rankingNear: "Top 5 cheapest near you",
    rankingProvince: (province) => `Top 5 cheapest in the province of ${province}`,
    rankingSubtitle: "Prices sorted from cheapest",
    reportPrice: "Report a price",
    loadingTitle: "Loading prices...",
    loadingText: "Updating prices for the selected area.",
    loadStationsError: "Unable to load fuel stations.",
    loadDataError: "Unable to load data right now.",
    exciseAccordion: "Fuel taxes and price breakdown"
  },
  cheapest: {
    empty: "No prices updated in the last 4 days with these filters.",
    fallbackTitle: (city) => `Cheapest${city ? ` (${city})` : ""}`,
    top: (count) => `Top ${count}`,
    showOnMap: "Show on map",
    directions: "Directions"
  },
  stats: { title: "Price summary", average: "Average price", minimum: "Lowest", maximum: "Highest", stations: "Stations" },
  citySummary: {
    title: (area) => `Fuel prices in the province of ${area}`,
    text: (area, average, minimum, maximum, count) =>
      `In the ${area} area the average price is ${average}. The lowest is ${minimum} and the highest is ${maximum}, across ${count} fuel stations in the current data.`,
    note: "Prices come from the official data published by the Italian Ministry of Enterprises (MIMIT)."
  },
  map: {
    loading: "Loading map...",
    listNear: "Fuel stations near you",
    listProvince: (province) => `Fuel stations in the province of ${province}`,
    stationsBadge: (count) => `Stations (${count})`,
    savings: (amount) => `Save ${amount} on a 50 L fill-up`,
    emptyList: "No stations with prices updated in the last 4 days for these filters.",
    chooseFuel: "Choose fuel",
    chooseProvince: "Choose province",
    chooseMode: "Choose service type",
    findStations: "Find stations",
    road: "Road",
    routeAria: (name) => `Get directions to ${name} on Google Maps`,
    routeTitle: "Open directions in Google Maps",
    updatedOn: (date) => `Updated: ${date}`,
    updatePrice: "Update",
    route: "Directions"
  },
  footer: {
    dataSource: "Price data from official Italian government sources (MIMIT). Updates may not be in real time.",
    mapData: "Maps and map data: OpenStreetMap contributors.",
    pricesByCity: "Prices by city",
    privacy: "Privacy (IT)",
    cookie: "Cookies (IT)",
    contact: "Contact",
    linksLabel: "Footer links"
  }
};

const es: Messages = {
  tagline: "Encuentra el repostaje que menos duele.",
  nav: { home: "Inicio", map: "Mapa", excise: "Impuestos", news: "Noticias", report: "Avisar", pricesByCity: "Precios por ciudad" },
  openMenu: "Abrir menú",
  closeMenu: "Cerrar menú",
  chooseLanguage: "Elegir idioma",
  mainNavigation: "Navegación principal",
  mobileNavigation: "Navegación móvil",
  fuelName: { BENZINA: "Gasolina", DIESEL: "Diésel", GPL: "GLP", METANO: "GNC" },
  fuelInSentence: { BENZINA: "gasolina", DIESEL: "diésel", GPL: "GLP", METANO: "GNC" },
  serviceMode: { self: "Autoservicio", served: "Atendido", all: "Mejor precio" },
  serviceModeShort: { self: "Autoservicio", served: "Atendido", all: "Mejor precio" },
  priceMode: { self: "autoservicio", served: "atendido" },
  filters: { province: "Provincia", fuel: "Combustible", mode: "Modalidad", find: "Buscar", quick: "Rápido", filterTitle: "Filtra precios y gasolineras" },
  location: {
    useMyLocation: "Usar mi ubicación",
    locating: "Buscando...",
    aroundYou: "Cerca de ti",
    notSupported: "La geolocalización no está disponible en este dispositivo.",
    denied: "Has denegado el acceso a tu ubicación. Actívalo en los ajustes del navegador o elige una provincia.",
    unavailable: "No podemos encontrar tu ubicación ahora. Inténtalo de nuevo en unos segundos o elige una provincia.",
    locateMe: "Ubícame",
    located: "Ubicación",
    locateAria: "Buscar mi ubicación en el mapa",
    locateTitle: "Buscar mi ubicación",
    youAreHere: "Estás aquí",
    kmFromYou: (km) => `a ${km} km de ti`
  },
  home: {
    priceInProvince: (fuel, province) => `Precio ${fuel === "BENZINA" ? "de la gasolina" : `del ${es.fuelInSentence[fuel]}`} en la provincia de ${province}`,
    stationsCount: (count) => `${count} gasolineras`,
    pricesUpdatedAt: (date) => `Precios actualizados el ${date}`,
    noStations: "No se han encontrado gasolineras con estos filtros.",
    removeFilters: "Quitar filtros",
    rankingNear: "Top 5 más baratas cerca de ti",
    rankingProvince: (province) => `Top 5 más baratas en la provincia de ${province}`,
    rankingSubtitle: "Precios ordenados de más barato a más caro",
    reportPrice: "Avisar de un precio",
    loadingTitle: "Cargando precios...",
    loadingText: "Actualizando los precios de la zona seleccionada.",
    loadStationsError: "No se pueden cargar las gasolineras.",
    loadDataError: "No se pueden cargar los datos en este momento.",
    exciseAccordion: "Impuestos y composición del precio"
  },
  cheapest: {
    empty: "No hay precios actualizados en los últimos 4 días con estos filtros.",
    fallbackTitle: (city) => `Más baratas${city ? ` (${city})` : ""}`,
    top: (count) => `Top ${count}`,
    showOnMap: "Ver en el mapa",
    directions: "Cómo llegar"
  },
  stats: { title: "Resumen de precios", average: "Precio medio", minimum: "Mínimo", maximum: "Máximo", stations: "Gasolineras" },
  citySummary: {
    title: (area) => `Precios del combustible en la provincia de ${area}`,
    text: (area, average, minimum, maximum, count) =>
      `En la zona de ${area} el precio medio es ${average}. El mínimo es ${minimum} y el máximo ${maximum}, en ${count} gasolineras de los datos actuales.`,
    note: "Los precios proceden de los datos oficiales publicados por el Ministerio de Empresas italiano (MIMIT)."
  },
  map: {
    loading: "Cargando el mapa...",
    listNear: "Gasolineras cerca de ti",
    listProvince: (province) => `Gasolineras en la provincia de ${province}`,
    stationsBadge: (count) => `Gasolineras (${count})`,
    savings: (amount) => `Ahorro: ${amount} en un depósito de 50 L`,
    emptyList: "No hay gasolineras con precios actualizados en los últimos 4 días con estos filtros.",
    chooseFuel: "Elegir combustible",
    chooseProvince: "Elegir provincia",
    chooseMode: "Elegir modalidad",
    findStations: "Buscar gasolineras",
    road: "Carretera",
    routeAria: (name) => `Cómo llegar a ${name} con Google Maps`,
    routeTitle: "Abrir la ruta en Google Maps",
    updatedOn: (date) => `Actualizado: ${date}`,
    updatePrice: "Actualizar",
    route: "Ruta"
  },
  footer: {
    dataSource: "Datos de precios procedentes de fuentes oficiales italianas (MIMIT). Las actualizaciones pueden no ser en tiempo real.",
    mapData: "Mapas y datos cartográficos: colaboradores de OpenStreetMap.",
    pricesByCity: "Precios por ciudad",
    privacy: "Privacidad (IT)",
    cookie: "Cookies (IT)",
    contact: "Contacto",
    linksLabel: "Enlaces del pie de página"
  }
};

const MESSAGES: Record<Locale, Messages> = { it, en, es };

export function getMessages(locale: Locale = "it"): Messages {
  return MESSAGES[locale] ?? it;
}
