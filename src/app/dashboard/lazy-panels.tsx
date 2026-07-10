"use client";

// Defers recharts, dnd-kit, and tanstack-table out of the dashboard's initial
// bundle; they stream in behind skeletons after hydration
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const LazyChartAreaInteractive = dynamic(
  () =>
    import("@/components/chart-area-interactive").then(
      (mod) => mod.ChartAreaInteractive
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
  }
);

export const LazyDataTable = dynamic(
  () => import("@/components/data-table").then((mod) => mod.DataTable),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    ),
  }
);
