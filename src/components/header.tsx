"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Navbar, navMenuItems } from "./navbar";
import { Button } from "./ui/button";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="">
      <nav
        aria-label="Global"
        className="mx-auto flex w-full items-center justify-between gap-x-6 p-6 lg:px-8"
      >
        <div className="flex">
          <Link className="-m-1.5 p-1.5" href="/">
            <span className="sr-only">Your Company</span>
            <Image
              alt=""
              className="h-8 w-auto"
              height="32"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              width="32"
            />
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
          <button
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
            type="button"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
      </nav>
      <Dialog
        className="lg:hidden"
        onClose={setMobileMenuOpen}
        open={mobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center gap-x-6">
            <a className="-m-1.5 p-1.5" href="/">
              <span className="sr-only">Your Company</span>
              <Image
                alt=""
                className="h-8 w-auto"
                height="32"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                width="32"
              />
            </a>
            <Button asChild className="ml-auto" variant="brutalist">
              <Link href="/register">Sign up</Link>
            </Button>
            <button
              className="-m-2.5 rounded-md p-2.5 text-foreground"
              onClick={() => setMobileMenuOpen(false)}
              type="button"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-foreground">
              <div className="space-y-2 py-6">
                {navMenuItems.map((item) => (
                  <Link
                    className="-mx-3 block rounded-lg px-3 py-2.5 font-semibold text-base/7"
                    href={item.href}
                    key={item.id}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <Link
                  className="-mx-3 block rounded-lg px-3 py-2.5 font-semibold text-base/7"
                  href="/login"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
