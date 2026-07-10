export interface NavItem {
  title: string;
  slug: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const docsNavigation: NavSection[] = [
  {
    items: [
      { title: "Overview", slug: "overview" },
      {
        title: "Quick Start",
        slug: "quick-start",
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        title: "Writing Content",
        slug: "guides/writing-content",
      },
    ],
  },
];

export function findDocBySlug(slug: string): NavItem | undefined {
  for (const section of docsNavigation) {
    const found = section.items.find((navItem) => navItem.slug === slug);
    if (found) {
      return found;
    }
  }
  return;
}

export function findSectionBySlug(slug: string): NavSection | undefined {
  for (const section of docsNavigation) {
    if (
      section.title &&
      section.items.some((navItem) => navItem.slug === slug)
    ) {
      return section;
    }
  }
  return;
}

export function getAllDocSlugs(): string[] {
  return docsNavigation.flatMap((section) =>
    section.items.map((item) => item.slug)
  );
}
