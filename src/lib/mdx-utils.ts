import fs from "node:fs";
import path from "node:path";

export interface BaseMetadata {
  title: string;
  description?: string;
}

export interface BlogMetadata extends BaseMetadata {
  publishedAt: string;
  description: string;
  image?: string;
}

export type DocMetadata = BaseMetadata & {
  description: string;
};

const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
const quotesRegex = /^['"](.*)['"]$/;

export function parseFrontmatter<T extends BaseMetadata>(
  fileContent: string
): { metadata: T; content: string } {
  const match = frontmatterRegex.exec(fileContent);
  const frontMatterBlock = match?.[1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const metadata: Record<string, string> = {};

  if (frontMatterBlock) {
    const frontMatterLines = frontMatterBlock.trim().split("\n");
    for (const line of frontMatterLines) {
      const [key, ...valueArr] = line.split(": ");
      let value = valueArr.join(": ").trim();
      value = value.replace(quotesRegex, "$1"); // Remove quotes
      metadata[key.trim()] = value;
    }
  }

  return { metadata: metadata as unknown as T, content };
}

export function getMDXFiles(dir: string, extension = ".mdx") {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === extension);
}

export function readMDXFile<T extends BaseMetadata>(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter<T>(rawContent);
}

export function getMDXData<T extends BaseMetadata>(
  dir: string,
  extension = ".mdx"
) {
  const mdxFiles = getMDXFiles(dir, extension);
  return mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile<T>(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

export interface Heading {
  level: number;
  text: string;
  slug: string;
}

function slugify(str: string) {
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
