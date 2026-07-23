import { getPage } from "@/lib/data";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { sanitizeArticleHtml } from "@/lib/sanitize";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Bodhanam Quarterly",
};

export default async function AboutPage() {
  const page = await getPage("about");

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-primary mb-3">
          Quarterly Journal
        </p>
        <h1 className="font-serif-ml text-4xl md:text-5xl lg:text-6xl font-bold text-ink mb-4 leading-tight">
          {page.title}
        </h1>
        <div className="w-16 h-1 rounded-full bg-primary mb-8 md:mb-12" />
        <div
          className="content-card prose-ml prose-ml-wide text-base md:text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(page.bodyHtml) }}
        />
      </div>
    </div>
  );
}
