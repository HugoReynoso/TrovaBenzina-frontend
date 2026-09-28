export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export type LocateFailure = "denied" | "unavailable";

interface LocateUserOptions {
  onSuccess: (coordinates: UserCoordinates) => void;
  onFailure: (reason: LocateFailure) => void;
  /** Tempo massimo di attesa prima di dichiarare la posizione non disponibile. */
  deadlineMs?: number;
}

const PERMISSION_DENIED = 1;

/**
 * Chiede la posizione dell'utente in modo tollerante.
 *
 * Al primo accesso molti browser (Safari iOS, Chrome con il popup dei permessi appena
 * accettato, PC senza GPS) segnalano prima un errore "temporaneo" e solo dopo la posizione
 * vera. Per evitare di mostrare un errore che poi sparisce:
 * - avviamo in parallelo una richiesta ad alta precisione (watchPosition) e una a bassa precisione;
 * - la prima posizione valida vince;
 * - gli errori temporanei vengono ignorati: falliamo solo se l'utente nega il permesso
 *   o se entro `deadlineMs` non arriva nessuna posizione.
 *
 * Restituisce una funzione per annullare la richiesta (es. allo smontaggio del componente).
 */
export function locateUser({ onSuccess, onFailure, deadlineMs = 20000 }: LocateUserOptions): () => void {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onFailure("unavailable");
    return () => undefined;
  }

  const geolocation = navigator.geolocation;
  let settled = false;
  let watchId: number | null = null;
  let deadlineTimer = 0;

  const cleanup = () => {
    if (watchId !== null) {
      geolocation.clearWatch(watchId);
      watchId = null;
    }
    window.clearTimeout(deadlineTimer);
  };

  const succeed = (position: GeolocationPosition) => {
    if (settled) {
      return;
    }
    settled = true;
    cleanup();
    onSuccess({ latitude: position.coords.latitude, longitude: position.coords.longitude });
  };

  const fail = (reason: LocateFailure) => {
    if (settled) {
      return;
    }
    settled = true;
    cleanup();
    onFailure(reason);
  };

  const handleError = (error: GeolocationPositionError) => {
    if (error.code === PERMISSION_DENIED) {
      fail("denied");
    }
    // POSITION_UNAVAILABLE / TIMEOUT: errore temporaneo, aspettiamo la prossima posizione o la scadenza.
  };

  deadlineTimer = window.setTimeout(() => fail("unavailable"), deadlineMs);

  watchId = geolocation.watchPosition(succeed, handleError, {
    enableHighAccuracy: true,
    maximumAge: 60000,
    timeout: deadlineMs
  });

  geolocation.getCurrentPosition(succeed, handleError, {
    enableHighAccuracy: false,
    maximumAge: 300000,
    timeout: deadlineMs
  });

  return () => {
    settled = true;
    cleanup();
  };
}
