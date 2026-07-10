import Link from "next/link";
import { HeaderMobileMenu } from "./header-mobile-menu";
import { Logo } from "./logo";
import { Navbar } from "./navbar";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="">
      <nav
        aria-label="Global"
        className="mx-auto flex w-full items-center justify-between gap-x-6 p-6 lg:px-8"
      >
        <div className="flex">
          <Link className="-m-1.5 p-1.5" href="/">
            <span className="sr-only">
              {process.env.NEXT_PUBLIC_PROJECT_NAME}
            </span>
            <Logo className="h-8 w-8 text-primary" />
          </Link>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Navbar />
        </div>
        <div className="flex flex-1 items-center justify-end gap-x-6">
          <Button asChild className="hidden lg:block" variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="brutalist">
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
        <div className="flex lg:hidden">
          <HeaderMobileMenu />
        </div>
      </nav>
    </header>
  );
}
