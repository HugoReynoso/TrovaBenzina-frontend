export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export type LocateFailure = "denied" | "unavailable";

interface LocateUserOptions {
  onSuccess: (coordinates: UserCoordinates) => void;
  onFailure: (reason: LocateFailure) => void;
  /** Dopo quanto tempo senza posizione mostrare l'errore "posizione non disponibile". */
  failureAfterMs?: number;
  /** Per quanto tempo continuare comunque ad ascoltare il GPS (una posizione tardiva corregge l'errore). */
  listenForMs?: number;
}

const PERMISSION_DENIED = 1;

async function isPermissionReallyDenied(): Promise<boolean> {
  try {
    if (!navigator.permissions?.query) {
      return true;
    }
    const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return status.state === "denied";
  } catch {
    return true;
  }
}

/**
 * Chiede la posizione dell'utente in modo tollerante.
 *
 * Al primo accesso i browser si comportano in modo strano: mentre e' aperto il popup dei permessi
 * (o subito dopo averlo accettato) possono segnalare errori "provvisori" - perfino PERMISSION_DENIED -
 * e poi inviare comunque la posizione vera. Quindi:
 * - avviamo una richiesta ad alta precisione (watchPosition) e una a bassa precisione in parallelo;
 * - la prima posizione valida vince, anche se arriva DOPO che abbiamo segnalato un errore
 *   (onSuccess puo' quindi essere chiamato dopo onFailure: chi usa la funzione deve togliere l'errore);
 * - "denied" solo se il browser conferma che il permesso e' davvero negato;
 * - "unavailable" solo se entro `failureAfterMs` non arriva niente (ma continuiamo ad ascoltare).
 *
 * Restituisce una funzione per annullare la richiesta (es. allo smontaggio del componente).
 */
export function locateUser({ onSuccess, onFailure, failureAfterMs = 30000, listenForMs = 120000 }: LocateUserOptions): () => void {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onFailure("unavailable");
    return () => undefined;
  }

  const geolocation = navigator.geolocation;
  let finished = false;
  let failureReported = false;
  let watchId: number | null = null;
  let failureTimer = 0;
  let stopTimer = 0;

  const stop = () => {
    finished = true;
    if (watchId !== null) {
      geolocation.clearWatch(watchId);
      watchId = null;
    }
    window.clearTimeout(failureTimer);
    window.clearTimeout(stopTimer);
  };

  const reportFailure = (reason: LocateFailure) => {
    if (finished || failureReported) {
      return;
    }
    failureReported = true;
    onFailure(reason);
  };

  const handleSuccess = (position: GeolocationPosition) => {
    if (finished) {
      return;
    }
    stop();
    onSuccess({ latitude: position.coords.latitude, longitude: position.coords.longitude });
  };

  const handleError = (error: GeolocationPositionError) => {
    if (finished || error.code !== PERMISSION_DENIED) {
      // POSITION_UNAVAILABLE / TIMEOUT: provvisorio, aspettiamo la prossima posizione.
      return;
    }

    void isPermissionReallyDenied().then((denied) => {
      if (denied && !finished) {
        reportFailure("denied");
        stop();
      }
    });
  };

  failureTimer = window.setTimeout(() => reportFailure("unavailable"), failureAfterMs);
  stopTimer = window.setTimeout(() => {
    reportFailure("unavailable");
    stop();
  }, listenForMs);

  watchId = geolocation.watchPosition(handleSuccess, handleError, {
    enableHighAccuracy: true,
    maximumAge: 60000
  });

  geolocation.getCurrentPosition(handleSuccess, handleError, {
    enableHighAccuracy: false,
    maximumAge: 300000,
    timeout: listenForMs
  });

  return stop;
}

/** Distanza in linea d'aria (km) tra due punti. */
export function distanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }): number {
  const earthRadiusKm = 6371;
  const degreesToRadians = Math.PI / 180;
  const deltaLatitude = (to.latitude - from.latitude) * degreesToRadians;
  const deltaLongitude = (to.longitude - from.longitude) * degreesToRadians;
  const fromLatitude = from.latitude * degreesToRadians;
  const toLatitude = to.latitude * degreesToRadians;
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
