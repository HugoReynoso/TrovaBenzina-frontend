import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { mockNews } from "@/mocks/news";
import { absoluteUrl, breadcrumbJsonLd, defaultOgImage, siteName, siteUrl } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = mockNews.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/notizie/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/notizie/${slug}`,
      type: "article",
      publishedTime: article.date,
      siteName,
      locale: "it_IT",
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: article.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [defaultOgImage]
    }
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

  const articleUrl = absoluteUrl(`/notizie/${article.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.excerpt,
      image: `${siteUrl}${defaultOgImage}`,
      datePublished: article.date,
      dateModified: article.date,
      author: {
        "@type": "Organization",
        name: siteName
      },
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl
      },
      mainEntityOfPage: articleUrl,
      inLanguage: "it-IT",
      articleSection: article.category
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Notizie", path: "/notizie" },
      { name: article.title, path: `/notizie/${article.slug}` }
    ])
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-ink/58" aria-label="Breadcrumb">
          <Link className="hover:text-petrol" href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link className="hover:text-petrol" href="/notizie">Notizie</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{article.category}</span>
        </nav>
        <p className="text-sm font-black uppercase tracking-[0.08em] text-amber">{article.category}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">{article.title}</h1>
        <p className="mt-3 text-ink/68">{article.excerpt}</p>
        <time className="mt-3 block text-sm font-bold text-ink/52" dateTime={article.date}>
          Aggiornato il {new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(article.date))}
        </time>
        <article className="mt-8 grid gap-4 leading-relaxed text-ink/78">
          {article.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
        {article.relatedLinks?.length ? (
          <section className="mt-8 rounded-md border border-ink/10 bg-white p-4 shadow-sm" aria-labelledby="guide-correlate">
            <h2 id="guide-correlate" className="text-xl font-black text-ink">Guide correlate</h2>
            <div className="mt-4 grid gap-3">
              {article.relatedLinks.map((link) => (
                <Link key={link.href} className="rounded-md border border-ink/10 p-3 transition hover:border-petrol/35 hover:bg-petrol/5" href={link.href}>
                  <span className="block font-black text-petrol">{link.label}</span>
                  <span className="mt-1 block text-sm text-ink/64">{link.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
