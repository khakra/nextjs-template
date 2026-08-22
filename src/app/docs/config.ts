export interface NavItem {
  slug: string;
  title: string;
}

export interface NavSection {
  items: NavItem[];
  title?: string;
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
}

export function getAllDocSlugs(): string[] {
  return docsNavigation.flatMap((section) =>
    section.items.map((item) => item.slug)
  );
}
