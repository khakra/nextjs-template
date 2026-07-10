import path from "node:path";
import type { DocMetadata } from "@/lib/mdx-utils";
import { getMDXData, readMDXFile } from "@/lib/mdx-utils";

export function getDocPages() {
  return getMDXData<DocMetadata>(
    path.join(process.cwd(), "src", "app", "docs", "content"),
    ".md"
  );
}

export function getDocBySlug(slug: string) {
  const filePath = path.join(
    process.cwd(),
    "src",
    "app",
    "docs",
    "content",
    `${slug}.md`
  );

  try {
    const { metadata, content } = readMDXFile<DocMetadata>(filePath);
    return {
      metadata,
      slug,
      content,
    };
  } catch {
    return null;
  }
}
