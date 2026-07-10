import type { Metadata } from "next";
import Link from "next/link";
import { docsNavigation } from "@/app/docs/config";

export const metadata: Metadata = {
  title: "Guides",
  description: `Step-by-step ${process.env.NEXT_PUBLIC_PROJECT_NAME} guides for common workflows.`,
};

const guideDescriptions: Record<string, string> = {
  "guides/writing-content":
    "Add blog posts, docs pages, and guides with MDX and frontmatter.",
};

export default function GuidesPage() {
  const guides =
    docsNavigation.find((section) => section.title === "Guides")?.items ?? [];

  return (
    <div className="max-w-4xl">
      <nav className="mb-6 flex items-center gap-2 text-neutral-600 text-sm dark:text-neutral-400">
        <Link
          className="hover:text-neutral-900 dark:hover:text-neutral-100"
          href="/docs"
        >
          Docs
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100">Guides</span>
      </nav>

      <div className="mb-10">
        <h1 className="font-bold text-4xl text-neutral-950 tracking-tight dark:text-neutral-50">
          Guides
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          Practical walkthroughs for setting up and using the product.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <Link
            className="group rounded-lg border border-neutral-200 p-5 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
            href={`/docs/${guide.slug}`}
            key={guide.slug}
          >
            <h2 className="font-semibold text-neutral-950 text-xl dark:text-neutral-50">
              {guide.title}
            </h2>
            <p className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">
              {guideDescriptions[guide.slug]}
            </p>
            <div className="mt-5 font-medium text-neutral-900 text-sm dark:text-neutral-100">
              Read guide{" "}
              <span className="inline-block transition-transform group-hover:translate-x-0.5">
                -&gt;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
