"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNavigation, type NavSection } from "@/app/docs/config";
import { cn } from "@/lib/utils";

function NavSectionComponent({
  section,
  currentSlug,
}: {
  section: NavSection;
  currentSlug: string;
}) {
  if (!section.title) {
    return (
      <ul className="mb-4 space-y-1">
        {section.items.map((item) => (
          <li key={item.slug}>
            <Link
              className={cn(
                "block rounded-md py-1.5 text-sm transition-colors",
                currentSlug === item.slug
                  ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100"
              )}
              href={`/docs/${item.slug}`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mb-4">
      <Link
        className="block py-2 font-semibold text-neutral-600 text-sm hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        href={`/docs/${section.title.toLowerCase()}`}
      >
        {section.title}
      </Link>
      <ul className="mt-1 space-y-1">
        {section.items.map((item) => (
          <li key={item.slug}>
            <Link
              className={cn(
                "block rounded-md py-1.5 pl-4 text-sm transition-colors",
                currentSlug === item.slug
                  ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100"
              )}
              href={`/docs/${item.slug}`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();
  const currentSlug = pathname.replace("/docs/", "") || "overview";

  return (
    <nav className="space-y-2">
      {docsNavigation.map((section) => (
        <NavSectionComponent
          currentSlug={currentSlug}
          key={section.title ?? "docs"}
          section={section}
        />
      ))}
    </nav>
  );
}
