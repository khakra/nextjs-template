import data from "@/app/dashboard/data.json";
import {
  LazyChartAreaInteractive,
  LazyDataTable,
} from "@/app/dashboard/lazy-panels";
import { SectionCards } from "@/components/section-cards";

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <LazyChartAreaInteractive />
        </div>
        <LazyDataTable data={data} />
      </div>
    </div>
  );
}
