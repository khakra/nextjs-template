import { DocsMobileNav } from "@/components/docs/mobile-nav";
import { DocsSidebar } from "@/components/docs/sidebar";
import Header from "@/components/header";
import { SimpleFooter } from "@/components/simple-footer";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
      <Header />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-160px)]">
          <DocsMobileNav />

          {/* Desktop sidebar */}
          <aside className="sticky top-20 hidden h-[calc(100vh-80px)] w-64 flex-shrink-0 overflow-y-auto border-neutral-200 border-r py-8 pr-6 lg:block dark:border-neutral-800">
            <DocsSidebar />
          </aside>

          {/* Main content */}
          <main className="flex-1 py-8 lg:pl-8">{children}</main>
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
}
