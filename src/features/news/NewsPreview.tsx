import Link from "next/link";
import { mockNews } from "@/mocks/news";

export function NewsPreview() {
  return (
    <section aria-labelledby="notizie" className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="notizie" className="text-xl font-black text-ink">
          Notizie e guide
        </h2>
        <Link className="text-sm font-black text-petrol hover:underline" href="/notizie">
          Tutte
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {mockNews.slice(0, 3).map((article) => (
          <article key={article.slug} className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-amber">{article.category}</p>
            <h3 className="mt-2 text-lg font-black leading-tight text-ink">
              <Link href={`/notizie/${article.slug}`}>{article.title}</Link>
            </h3>
            <p className="mt-2 text-sm text-ink/66">{article.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
