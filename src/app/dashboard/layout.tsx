import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { StopImpersonatingButton } from "@/components/impersonate-button";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { requireSession } from "@/lib/session";
import "@/app/dashboard/theme.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={session.user} variant="inset" />
      <SidebarInset>
        {session.session.impersonatedBy && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl bg-amber-100 px-4 py-2 text-amber-950 text-sm lg:px-6 dark:bg-amber-950 dark:text-amber-100">
            <span>
              Impersonating <strong>{session.user.email}</strong>. This session
              ends after an hour.
            </span>
            <StopImpersonatingButton />
          </div>
        )}
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
      <Toaster position="top-center" />
    </SidebarProvider>
  );
}
