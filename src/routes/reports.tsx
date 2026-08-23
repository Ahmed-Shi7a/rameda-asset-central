import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSpreadsheet, FileText, Boxes, Coins, PackageOpen, Wrench } from "lucide-react";
import { toast } from "sonner";

import { BarChartCard, DonutChartCard, LineChartCard } from "@/components/charts";
import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard, NoAccess } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  locationData,
  maintenanceCostMonthly,
  statusData,
  typeData,
} from "@/lib/analytics";
import { useApp } from "@/lib/app-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSET_STATUSES, type Asset } from "@/lib/types";
import { exportAssetsExcel, exportAssetsPdf } from "@/lib/export";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — AssetFlow" },
      {
        name: "description",
        content: "Visual reports for asset status, location, device type and maintenance costs.",
      },
      { property: "og:title", content: "Reports & Analytics — AssetFlow" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { assets, maintenance, can } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const exportRows: Asset[] =
    statusFilter === "all" ? assets : assets.filter((a) => a.status === statusFilter);

  if (!can("reports.view")) {
    return (
      <AppLayout title="Reports">
        <NoAccess feature="view reports" />
      </AppLayout>
    );
  }

  const totalCost = maintenance.reduce((sum, m) => sum + (m.cost ?? 0), 0);

  return (
    <AppLayout
      title="Reports & Analytics"
      description="Real-time analytics across inventory status, locations, device categories, and maintenance expenses."
      actions={
        can("reports.export") ? (
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[160px] text-xs" aria-label="Status filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ASSET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/50 p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                onClick={() => {
                  exportAssetsPdf(exportRows, statusFilter);
                  toast.success(`PDF report generated (${exportRows.length} assets)`);
                }}
              >
                <FileText className="size-3.5 text-rose-500" /> PDF
              </Button>

              <div className="h-4 w-[1px] bg-border" />

              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30"
                onClick={() => {
                  exportAssetsExcel(exportRows, statusFilter);
                  toast.success(`Excel report exported (${exportRows.length} assets)`);
                }}
              >
                <FileSpreadsheet className="size-3.5 text-emerald-600" /> Excel
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {/* Analytics KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Assets" value={assets.length} icon={<Boxes className="size-5" />} />
        <KpiCard
          label="Stock Assets"
          value={assets.filter((a) => a.status === "Stock").length}
          icon={<PackageOpen className="size-5" />}
        />
        <KpiCard
          label="Maintenance Jobs"
          value={maintenance.length}
          icon={<Wrench className="size-5" />}
        />
        <KpiCard
          label="Maintenance Cost"
          value={`EGP ${totalCost.toLocaleString()}`}
          icon={<Coins className="size-5" />}
        />
      </div>

      {/* Analytics Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DonutChartCard title="Asset Status Breakdown" data={statusData(assets)} />
        <BarChartCard title="Assets by Location" data={locationData(assets)} />
        <BarChartCard title="Assets by Hardware Type" data={typeData(assets)} color="var(--chart-3)" />
        <div className="lg:col-span-2">
          <LineChartCard
            title="Maintenance Cost Over Time (EGP)"
            data={maintenanceCostMonthly(maintenance)}
          />
        </div>
      </div>
    </AppLayout>
  );
}