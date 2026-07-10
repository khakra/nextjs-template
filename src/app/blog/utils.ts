import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { z } from "zod";

interface BlogImage {
  src: string;
  alt?: string;
}

export interface BlogMetadata {
  title: string;
  publishedAt: string;
  updatedAt?: string;
  description: string;
  image?: BlogImage;
  tags?: string[];
  canonical?: string;
  draft?: boolean;
  noindex?: boolean;
  author?: string;
}

const imageSchema = z
  .object({
    src: z.string(),
    alt: z.string().optional(),
  })
  .strict();

const frontmatterSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    image: imageSchema.optional(),
    tags: z.array(z.string()).optional(),
    canonical: z.string().optional(),
    draft: z.boolean().optional(),
    noindex: z.boolean().optional(),
    author: z.string().optional(),
  })
  .strict();

function parseBlogFrontmatter(fileContent: string, filePath: string) {
  const { data, content } = matter(fileContent);
  const result = frontmatterSchema.safeParse(data);

  if (!result.success) {
    throw new Error(
      `Invalid blog frontmatter in ${filePath}: ${z.prettifyError(result.error)}`
    );
  }

  return {
    metadata: result.data satisfies BlogMetadata,
    content: content.trim(),
  };
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function getBlogData(dir: string) {
  return getMDXFiles(dir).map((file) => {
    const filePath = path.join(dir, file);
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { metadata, content } = parseBlogFrontmatter(rawContent, filePath);
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

// cache() dedupes the directory walk across generateMetadata, the page, and
// related-posts lookups within a single render
export const getBlogPosts = cache(() =>
  getBlogData(path.join(process.cwd(), "src", "app", "blog", "posts")).filter(
    (post) => !post.metadata.draft
  )
);

export function getSortedBlogPosts() {
  return getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  );
}

export function getRelatedBlogPosts(slug: string, limit = 3) {
  const posts = getSortedBlogPosts();
  const currentPost = posts.find((post) => post.slug === slug);

  if (!currentPost) {
    return [];
  }

  const currentTags = new Set(currentPost.metadata.tags || []);

  return posts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const matchingTags = (post.metadata.tags || []).filter((tag) =>
        currentTags.has(tag)
      );

      return {
        ...post,
        relevance: matchingTags.length,
      };
    })
    .sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }

      return (
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
      );
    })
    .slice(0, limit);
}

export function formatDate(date: string, includeRelative = false) {
  const currentDate = new Date();
  const dateString = date.includes("T") ? date : `${date}T00:00:00`;
  const targetDate = new Date(dateString);

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  const fullDate = targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (!includeRelative) {
    return fullDate;
  }

  return `${fullDate} (${formattedDate})`;
}
