// Shared by the desktop navbar (server component) and the mobile menu (client
// component). Kept out of both so importing the list doesn't pull either in.

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  description: string;
}

export const navMenuItems: NavMenuItem[] = [
  { id: "home", label: "Home", href: "/", description: "Go to homepage" },
  {
    id: "features",
    label: "Features",
    href: "#features",
    description: "View product features",
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "#pricing",
    description: "See pricing plans",
  },
  {
    id: "blog",
    label: "Blog",
    href: "/blog",
    description: "Read our latest posts",
  },
  {
    id: "docs",
    label: "Docs",
    href: "/docs",
    description: "Browse documentation",
  },
];
