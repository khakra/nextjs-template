"use client";

import Link from "next/link";
import type * as React from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

// Navigation menu items configuration
export const navMenuItems = [
  {
    id: "home",
    label: "Home",
    href: "/",
    description: "Go to homepage",
  },
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

export function Navbar() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {navMenuItems.map((item) => (
          <NavigationMenuItem key={item.id}>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href={item.href}>{item.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function _ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="font-medium text-sm leading-none">{title}</div>
          <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
