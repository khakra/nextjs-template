import path from "node:path";
import { cache } from "react";
import { getAllDocSlugs } from "@/app/docs/config";
import { readMDXFile } from "@/lib/mdx-utils";

// cache() dedupes the file read between generateMetadata and the page render.
// The allow-list check also keeps route params from reaching the filesystem.
export const getDocBySlug = cache((slug: string) => {
  if (!getAllDocSlugs().includes(slug)) {
    return null;
  }

  const filePath = path.join(
    process.cwd(),
    "src",
    "app",
    "docs",
    "content",
    `${slug}.md`
  );

  try {
    const { metadata, content } = readMDXFile(filePath);
    return {
      metadata,
      slug,
      content,
    };
  } catch {
    return null;
  }
});
