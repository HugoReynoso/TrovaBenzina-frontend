import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { withBasePath } from "@/lib/site";
import { LanguageSelector } from "./LanguageSelector";

const navItems = [
  { href: "/prezzo-benzina/milano", label: "Prezzi" },
  { href: "/storico-prezzo-benzina/milano", label: "Storico" },
  { href: "/accise-benzina", label: "Accise" },
  { href: "/notizie", label: "Notizie" },
  { href: "/segnala-prezzo", label: "Segnala" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-black tracking-normal text-ink" aria-label="TrovaBenzina home">
          <Image src={withBasePath("/brand/trovabenzina-mark.svg")} alt="" width={40} height={40} priority />
          <span className="leading-none">TrovaBenzina</span>
        </Link>
        <nav aria-label="Navigazione principale" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-ink/76 transition hover:bg-ink/5 hover:text-ink"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <button className="grid size-10 place-items-center rounded-md border border-ink/10 bg-white md:hidden" aria-label="Apri menu">
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
