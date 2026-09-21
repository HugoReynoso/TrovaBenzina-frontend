import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { mockNews } from "@/mocks/news";

export const metadata: Metadata = {
  title: "Notizie Carburanti",
  description: "Guide e aggiornamenti su prezzi carburanti, accise, self service e risparmio alla pompa.",
  alternates: { canonical: "/notizie" }
};

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <h1 className="text-3xl font-black text-ink">Notizie carburanti</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {mockNews.map((article) => (
            <article className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" key={article.slug}>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-amber">{article.category}</p>
              <h2 className="mt-2 text-xl font-black text-ink">
                <Link href={`/notizie/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className="mt-2 text-sm text-ink/68">{article.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
