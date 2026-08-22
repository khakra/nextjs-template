import fs from "node:fs";
import matter from "gray-matter";
import { z } from "zod";

const docFrontmatterSchema = z
  .object({
    title: z.string(),
    description: z.string(),
  })
  .strict();

export type DocMetadata = z.infer<typeof docFrontmatterSchema>;

// Parses a docs markdown file; invalid frontmatter fails the build instead of
// rendering undefined titles
export function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);
  const result = docFrontmatterSchema.safeParse(data);

  if (!result.success) {
    throw new Error(
      `Invalid doc frontmatter in ${filePath}: ${z.prettifyError(result.error)}`
    );
  }

  return {
    metadata: result.data satisfies DocMetadata,
    content: content.trim(),
  };
}

export interface Heading {
  level: number;
  slug: string;
  text: string;
}

export function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Heading[] = [];

  for (const match of content.matchAll(headingRegex)) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({
      level,
      text,
      slug: slugify(text),
    });
  }

  return headings;
}
