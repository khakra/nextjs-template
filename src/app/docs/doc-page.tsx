import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findDocBySlug, findSectionBySlug } from "@/app/docs/config";
import { getDocBySlug } from "@/app/docs/utils";
import { baseUrl } from "@/app/sitemap";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { CustomMDX } from "@/components/mdx";
import { extractHeadings } from "@/lib/mdx-utils";

function sectionHref(title: string) {
  return `/docs/${title.toLowerCase().replace(/\s+/g, "-")}`;
}

export function generateDocMetadata(slug: string): Metadata {
  const doc = getDocBySlug(slug);
  const navItem = findDocBySlug(slug);

  if (!(doc && navItem)) {
    return {
      title: "Not Found",
    };
  }

  const { title } = doc.metadata;

  return {
    title,
    description: doc.metadata.description,
    openGraph: {
      title,
      description: doc.metadata.description,
      type: "article",
      url: `${baseUrl}/docs/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: doc.metadata.description,
    },
  };
}

export function DocsContentPage({ slug }: { slug: string }) {
  const doc = getDocBySlug(slug);
  const navItem = findDocBySlug(slug);
  const section = findSectionBySlug(slug);

  if (!(doc && navItem)) {
    notFound();
  }

  const headings = extractHeadings(doc.content);

  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1">
        <nav className="mb-6 flex items-center gap-2 text-neutral-600 text-sm dark:text-neutral-400">
          <a
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
            href="/docs"
          >
            Docs
          </a>
          <span>/</span>
          {section?.title && (
            <>
              <a
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
                href={sectionHref(section.title)}
              >
                {section.title}
              </a>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-900 dark:text-neutral-100">
            {navItem.title}
          </span>
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20">
          <CustomMDX source={doc.content} />
        </article>
      </div>

      {headings.length > 0 && (
        <aside className="sticky top-20 hidden h-fit w-48 flex-shrink-0 xl:block">
          <TableOfContents headings={headings} />
        </aside>
      )}
    </div>
  );
}
