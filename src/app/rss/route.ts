import { getSortedBlogPosts } from "@/app/blog/utils";
import { baseUrl } from "@/app/sitemap";

// Posts are read from disk at build time, so the feed never changes between
// deploys — serve it statically instead of re-reading every post per request.
export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const allBlogs = getSortedBlogPosts();
  const projectName = escapeXml(process.env.NEXT_PUBLIC_PROJECT_NAME || "");

  const itemsXml = allBlogs
    .map((post) => {
      const url = `${baseUrl}/blog/${post.slug}`;
      return `<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${escapeXml(url)}</link>
          <guid isPermaLink="true">${escapeXml(url)}</guid>
          <description>${escapeXml(post.metadata.description)}</description>
          <pubDate>${new Date(
            post.metadata.publishedAt
          ).toUTCString()}</pubDate>
        </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${projectName}</title>
        <link>${escapeXml(baseUrl)}</link>
        <atom:link href="${escapeXml(`${baseUrl}/rss`)}" rel="self" type="application/rss+xml" />
        <description>RSS feed for ${projectName} blog posts</description>
        ${itemsXml}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
