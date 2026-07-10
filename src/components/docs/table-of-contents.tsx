"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/mdx-utils";
import { cn } from "@/lib/utils";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeSlug, setActiveSlug] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-2">
      <p className="font-semibold text-neutral-900 text-sm dark:text-neutral-100">
        On this page
      </p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.slug}>
            <a
              className={cn(
                "block transition-colors",
                heading.level === 3 && "pl-3",
                activeSlug === heading.slug
                  ? "font-medium text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              )}
              href={`#${heading.slug}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
