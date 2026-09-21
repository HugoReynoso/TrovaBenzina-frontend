import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { mockNews } from "@/mocks/news";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = mockNews.find((item) => item.slug === slug);
  return {
    title: article?.title ?? "Notizia",
    description: article?.excerpt,
    alternates: { canonical: `/notizie/${slug}` }
  };
}

export function generateStaticParams() {
  return mockNews.map((article) => ({ slug: article.slug }));
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = mockNews.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <p className="text-sm font-black uppercase tracking-[0.08em] text-amber">{article.category}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">{article.title}</h1>
        <p className="mt-3 text-ink/68">{article.excerpt}</p>
        <article className="mt-8 grid gap-4 leading-relaxed text-ink/78">
          {article.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
