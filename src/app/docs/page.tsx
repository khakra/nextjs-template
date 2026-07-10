import type { Metadata } from "next";
import Link from "next/link";
import { docsNavigation } from "@/app/docs/config";

export const metadata: Metadata = {
  title: "Documentation",
  description: `Setup guides and reference documentation for ${process.env.NEXT_PUBLIC_PROJECT_NAME}.`,
};

const sectionDescriptions: Record<string, string> = {
  Guides: "Step-by-step walkthroughs for common workflows.",
};

const pageDescriptions: Record<string, string> = {
  overview: "Learn what this product does and how the pieces fit together.",
  "quick-start": "Get your first setup moving with the shortest path.",
};

export default function DocsPage() {
  const topLevelItems = docsNavigation.flatMap((section) =>
    section.title ? [] : section.items
  );
  const groupedSections = docsNavigation.filter((section) => section.title);

  return (
    <div className="max-w-4xl">
      <nav className="mb-6 text-neutral-600 text-sm dark:text-neutral-400">
        <span className="text-neutral-900 dark:text-neutral-100">Docs</span>
      </nav>

      <div className="mb-10">
        <h1 className="font-bold text-4xl text-neutral-950 tracking-tight dark:text-neutral-50">
          {process.env.NEXT_PUBLIC_PROJECT_NAME} documentation
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          Everything you need to set up the product and get the most out of it.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topLevelItems.map((item) => (
          <Link
            className="group rounded-lg border border-neutral-200 p-5 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
            href={`/docs/${item.slug}`}
            key={item.slug}
          >
            <h2 className="font-semibold text-neutral-950 text-xl dark:text-neutral-50">
              {item.title}
            </h2>
            <p className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">
              {pageDescriptions[item.slug]}
            </p>
            <div className="mt-5 font-medium text-neutral-900 text-sm dark:text-neutral-100">
              Open page{" "}
              <span className="inline-block transition-transform group-hover:translate-x-0.5">
                -&gt;
              </span>
            </div>
          </Link>
        ))}

        {groupedSections.map((section) => (
          <section
            className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
            key={section.title}
          >
            <h2 className="font-semibold text-neutral-950 text-xl dark:text-neutral-50">
              <Link
                className="hover:text-neutral-700 dark:hover:text-neutral-300"
                href="/docs/guides"
              >
                {section.title}
              </Link>
            </h2>
            <p className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">
              {section.title ? sectionDescriptions[section.title] : null}
            </p>
            <ul className="mt-5 space-y-2">
              {section.items.map((item) => (
                <li key={item.slug}>
                  <Link
                    className="group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    href={`/docs/${item.slug}`}
                  >
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {item.title}
                    </span>
                    <span className="text-neutral-400 transition-transform group-hover:translate-x-0.5">
                      -&gt;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
