import { getSortedBlogPosts } from "@/app/blog/utils";
import { getAllDocSlugs } from "@/app/docs/config";

export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function routePriority(route: string) {
  if (route === "") {
    return 1;
  }

  if (route === "/docs") {
    return 0.8;
  }

  if (route === "/privacy-policy" || route === "/terms-of-service") {
    return 0.3;
  }

  return 0.7;
}

// Static pages have no per-page modification date, and stamping today's date on
// every build makes unchanged pages advertise a fresh lastmod each deploy, which
// teaches crawlers to ignore the signal. Bump this when the pages actually change.
const STATIC_PAGES_LAST_MODIFIED = "2026-08-21";

export default function sitemap() {
  const blogs = getSortedBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.updatedAt || post.metadata.publishedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const docs = [
    "/docs/guides",
    ...getAllDocSlugs().map((slug) => `/docs/${slug}`),
  ]
    .sort()
    .map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: route.startsWith("/docs/guides/") ? 0.85 : 0.8,
    }));

  const routes = [
    "",
    "/blog",
    "/docs",
    "/privacy-policy",
    "/terms-of-service",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: STATIC_PAGES_LAST_MODIFIED,
    changeFrequency: "weekly" as const,
    priority: routePriority(route),
  }));

  return [...routes, ...docs, ...blogs];
}
