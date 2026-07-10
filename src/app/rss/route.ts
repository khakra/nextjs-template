import { getSortedBlogPosts } from "@/app/blog/utils";
import { baseUrl } from "@/app/sitemap";

export function GET() {
  const allBlogs = getSortedBlogPosts();

  const itemsXml = allBlogs
    .map(
      (post) =>
        `<item>
          <title>${post.metadata.title}</title>
          <link>${baseUrl}/blog/${post.slug}</link>
          <description>${post.metadata.description}</description>
          <pubDate>${new Date(
            post.metadata.publishedAt
          ).toUTCString()}</pubDate>
        </item>`
    )
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>${process.env.NEXT_PUBLIC_PROJECT_NAME}</title>
        <link>${baseUrl}</link>
        <description>RSS feed for ${process.env.NEXT_PUBLIC_PROJECT_NAME} blog posts</description>
        ${itemsXml}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
