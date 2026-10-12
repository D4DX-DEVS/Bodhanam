import type { MetadataRoute } from "next";
import { absUrl, articlePath, authorPath, getIndexableContent, issuePath, periodToIsoDate } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { issues, articles } = await getIndexableContent();
  const latestIssueId = issues[0]?.id;
  const issueDate = new Map(issues.map((i) => [i.id, periodToIsoDate(i.period)]));

  const staticPages: MetadataRoute.Sitemap = [
    { url: absUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absUrl("/archives"), changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/authors"), changeFrequency: "monthly", priority: 0.6 },
    { url: absUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: absUrl("/contact"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const issuePages: MetadataRoute.Sitemap = issues.map((i) => ({
    url: absUrl(issuePath(i.id)),
    ...(issueDate.get(i.id) && { lastModified: issueDate.get(i.id) }),
    changeFrequency: i.id === latestIssueId ? "weekly" : "yearly",
    priority: i.id === latestIssueId ? 0.9 : 0.7,
    ...(i.coverImage && { images: [absUrl(i.coverImage)] }),
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: absUrl(articlePath(a.id)),
    ...(issueDate.get(a.issueId) && { lastModified: issueDate.get(a.issueId) }),
    changeFrequency: "yearly",
    priority: 0.8,
    ...(a.coverImage && { images: [absUrl(a.coverImage)] }),
  }));

  const authors = new Set(articles.map((a) => a.author?.trim()).filter((n): n is string => !!n));
  const authorPages: MetadataRoute.Sitemap = [...authors].map((name) => ({
    url: absUrl(authorPath(name)),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticPages, ...issuePages, ...articlePages, ...authorPages];
}
