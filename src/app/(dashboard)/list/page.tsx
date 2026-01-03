import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import data from "./data.json";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-4 lg:px-6 py-4 md:py-6">
      <SectionCards />
      <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
        <ChartAreaInteractive />
      </div>
      <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
        <DataTable data={data} />
      </div>
    </div>
  );
}
