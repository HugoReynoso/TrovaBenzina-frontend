export interface BrowserPosition {
  latitude: number;
  longitude: number;
}

export function canUseBrowserPosition(): boolean {
  return typeof window !== "undefined" && Boolean(window.navigator.geolocation);
}

function toBrowserPosition(position: GeolocationPosition): BrowserPosition {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };
}

function readCurrentPosition(options: PositionOptions): Promise<BrowserPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }

    window.navigator.geolocation.getCurrentPosition(
      (position) => resolve(toBrowserPosition(position)),
      reject,
      options
    );
  });
}

function watchPositionOnce(options: PositionOptions, timeoutMs: number): Promise<BrowserPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }

    let watchId: number | null = null;
    const timeoutId = window.setTimeout(() => {
      if (watchId !== null) {
        window.navigator.geolocation.clearWatch(watchId);
      }
      reject(new DOMException("Geolocation request timed out", "TimeoutError"));
    }, timeoutMs);

    watchId = window.navigator.geolocation.watchPosition(
      (position) => {
        window.clearTimeout(timeoutId);
        if (watchId !== null) {
          window.navigator.geolocation.clearWatch(watchId);
        }
        resolve(toBrowserPosition(position));
      },
      (error) => {
        window.clearTimeout(timeoutId);
        if (watchId !== null) {
          window.navigator.geolocation.clearWatch(watchId);
        }
        reject(error);
      },
      options
    );
  });
}

export async function requestBrowserPosition(): Promise<BrowserPosition> {
  const attempts: Array<() => Promise<BrowserPosition>> = [
    () => readCurrentPosition({ enableHighAccuracy: true, maximumAge: 60000, timeout: 9000 }),
    () => readCurrentPosition({ enableHighAccuracy: false, maximumAge: 600000, timeout: 7000 }),
    () => watchPositionOnce({ enableHighAccuracy: false, maximumAge: 600000 }, 12000)
  ];
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;
      const code = typeof error === "object" && error !== null && "code" in error ? Number((error as { code?: number }).code) : 0;
      if (code === 1) {
        throw error;
      }
    }
  }

  throw lastError;
}

export function geolocationErrorMessage(error: unknown, actionLabel = "Usa la mia posizione"): string {
  const code = typeof error === "object" && error !== null && "code" in error ? Number((error as { code?: number }).code) : 0;

  if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
    return "La posizione funziona solo su HTTPS. Apri il sito dal dominio sicuro e riprova.";
  }

  if (code === 1) {
    return `Permesso posizione non attivo. Abilita la posizione nel browser e premi di nuovo ${actionLabel}.`;
  }

  if (code === 2) {
    return "Posizione non disponibile in questo momento. Puoi scegliere una provincia e premere Trova.";
  }

  if (code === 3) {
    return "La richiesta posizione e scaduta. Riprova tra qualche secondo o scegli una provincia.";
  }

  return "Non riesco a usare la tua posizione. Controlla i permessi del browser oppure scegli una provincia.";
}
