import Link from "next/link";
import { navMenuItems } from "@/lib/nav";

// A plain list of links — no triggers, no panels, no state — so this stays a
// server component. Using Radix NavigationMenu here shipped its runtime to every
// marketing page for no behaviour.
const linkStyle =
  "inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm outline-none transition-[color,box-shadow] hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function Navbar() {
  return (
    <nav aria-label="Main">
      <ul className="flex items-center gap-1">
        {navMenuItems.map((item) => (
          <li key={item.id}>
            <Link className={linkStyle} href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
