import Link from "next/link";
import { LOCALE_ROUTES, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

interface FooterProps {
  locale?: Locale;
}

export function Footer({ locale = "it" }: FooterProps) {
  const t = getMessages(locale);

  return (
    <footer className="mt-auto border-t border-ink/10 bg-white">
      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-8 text-sm text-ink/70 md:grid-cols-[1fr_auto] md:px-6">
        <div>
          <p className="font-black text-ink">
            <span>Trova</span>
            <span className="text-[#d49318]">Benzina</span>
          </p>
          <p className="mt-2 max-w-2xl">{t.footer.dataSource}</p>
          <p className="mt-2">{t.footer.mapData}</p>
        </div>
        <div className="grid content-start gap-2 md:justify-items-end">
          <nav aria-label={t.footer.linksLabel} className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
            <Link className="hover:text-petrol hover:underline" href={LOCALE_ROUTES[locale].fuelIndex}>
              {t.footer.pricesByCity}
            </Link>
            <Link className="hover:text-petrol hover:underline" href="/privacy">
              {t.footer.privacy}
            </Link>
            <Link className="hover:text-petrol hover:underline" href="/cookie-policy">
              {t.footer.cookie}
            </Link>
            <Link className="hover:text-petrol hover:underline" href="/chi-siamo">
              {t.footer.contact}
            </Link>
          </nav>
          <nav aria-label={t.chooseLanguage} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:justify-end">
            {SUPPORTED_LOCALES.map((item) => (
              <Link
                key={item.code}
                className={`hover:text-petrol hover:underline ${item.code === locale ? "font-black text-ink" : ""}`}
                href={LOCALE_ROUTES[item.code].home}
                hrefLang={item.intl}
                lang={item.code}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
