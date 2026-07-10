"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { DocsSidebar } from "@/components/docs/sidebar";

export function DocsMobileNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        className="fixed right-4 bottom-4 z-50 rounded-full bg-neutral-900 p-3 text-white shadow-lg lg:hidden dark:bg-neutral-100 dark:text-neutral-900"
        onClick={() => setMobileMenuOpen(true)}
        type="button"
      >
        <Bars3Icon className="h-6 w-6" />
        <span className="sr-only">Open navigation</span>
      </button>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            type="button"
          />
          <div className="fixed inset-y-0 left-0 w-72 overflow-y-auto bg-white p-6 dark:bg-neutral-900">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold text-lg">Documentation</span>
              <button
                className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setMobileMenuOpen(false)}
                type="button"
              >
                <XMarkIcon className="h-6 w-6" />
                <span className="sr-only">Close navigation</span>
              </button>
            </div>
            <DocsSidebar />
          </div>
        </div>
      ) : null}
    </>
  );
}
