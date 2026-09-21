import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm text-ink/70 md:grid-cols-[1fr_auto] md:px-6">
        <div>
          <p className="font-black text-ink">TrovaBenzina</p>
          <p className="mt-2 max-w-2xl">
            Dati prezzi provenienti da fonti ufficiali MIMIT. Gli aggiornamenti possono non essere in tempo reale.
          </p>
          <p className="mt-2">Mappe e dati cartografici: OpenStreetMap contributors.</p>
        </div>
        <nav aria-label="Link footer" className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
          <a
            className="text-sm font-bold text-ink/62 hover:text-petrol hover:underline"
            href="https://hugoreynoso.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            Reynoso
          </a>
          <Link className="hover:text-petrol hover:underline" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-petrol hover:underline" href="/cookie-policy">
            Cookie
          </Link>
          <span>Contatti futuri</span>
        </nav>
      </div>
    </footer>
  );
}
