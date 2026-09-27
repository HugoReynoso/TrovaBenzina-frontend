export interface NewsArticle {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  content: string[];
  relatedLinks?: Array<{
    href: string;
    label: string;
    description: string;
  }>;
}
