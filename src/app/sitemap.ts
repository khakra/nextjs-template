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

  return 0.7;
}

export default function sitemap() {
  const today = new Date().toISOString().split("T")[0];

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
      lastModified: today,
      changeFrequency: "weekly" as const,
      priority: route.startsWith("/docs/guides/") ? 0.85 : 0.8,
    }));

  const routes = ["", "/blog", "/docs"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: routePriority(route),
  }));

  return [...routes, ...docs, ...blogs];
}
