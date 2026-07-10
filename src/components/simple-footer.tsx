import Link from "next/link";
import { ModeToggle } from "@/components/dark-mode-toggle";

export function SimpleFooter() {
  return (
    <footer className="border-neutral-200 border-t dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-neutral-600 text-sm dark:text-neutral-400">
            &copy; {new Date().getFullYear()}{" "}
            <Link className="hover:underline" href="/">
              {process.env.NEXT_PUBLIC_PROJECT_NAME}
            </Link>
          </p>
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
}
