import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Boxes, 
  Coins, 
  Package, 
  Wrench,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

import { BarChartCard, DonutChartCard, LineChartCard } from "@/components/charts";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoAccess } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  component: ReportsPage,
});

function ReportsPage() {
  const { assets = [], maintenance = [], can } = useApp() as any;
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const exportRows: Asset[] =
    statusFilter === "all" ? assets : assets.filter((a: any) => a.status === statusFilter);

  if (typeof can === "function" && !can("reports.view")) {
    return (
      <AppLayout title="Reports">
        <NoAccess feature="view reports" />
      </AppLayout>
    );
  }

  // الحسابات الإحصائية
  const totalCost = maintenance.reduce((sum: number, m: any) => sum + (m.cost ?? 0), 0);
  const stockAssetsCount = assets.filter(
    (a: any) => a.status === "Stock" || a.status === "Stock - New" || a.status === "Stock - Used"
  ).length;
  const activeAssetsCount = assets.filter((a: any) => a.status === "Active" || a.status === "In-Use").length;

  function exportAssetsCsv(rows: Asset[], status: string) {
    if (rows.length === 0) {
      toast.error("No assets available to export.");
      return;
    }

    const headers = [
      "Asset ID",
      "Asset Name",
      "Device Type",
      "Brand",
      "Model",
      "Serial Number",
      "Status",
      "Location",
      "Assigned To",
      "Delivery Date",
      "Warranty (Months)",
    ];

    const csvContentRows = rows.map((a: any) => [
      `"${a.id || a.assetId || ""}"`,
      `"${a.name || a.assetName || ""}"`,
      `"${a.deviceType || a.hardwareType || a.type || a.category || ""}"`,
      `"${a.brand || ""}"`,
      `"${a.model || ""}"`,
      `"${a.serialNumber || a.serial || ""}"`,
      `"${a.status || ""}"`,
      `"${a.location || ""}"`,
      `"${a.holderName || a.assignedEmployee || a.assignedTo || a.user || "Unassigned"}"`,
      `"${a.deliveryDate || a.purchaseDate || ""}"`,
      `"${a.warranty || a.warrantyMonths || a.warrantyPeriod || ""}"`,
    ]);

    const csvString = [headers.join(","), ...csvContentRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `RAMEDA_Assets_Report_${status}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`CSV report exported (${rows.length} assets)`);
  }

  return (
    <AppLayout
      title="Reports & Analytics"
      description="Real-time analytics across inventory status, locations, device categories, and maintenance expenses."
      actions={
        typeof can === "function" && can("reports.export") ? (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* فلتر الحالة قبل التصدير */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[150px] bg-muted/40 border-border/80 text-xs shadow-sm" aria-label="Status filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses ({assets.length})</SelectItem>
                {ASSET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* أزرار التصدير الملونة */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card p-1 shadow-sm">
              {/* PDF */}
              <button
                type="button"
                onClick={() => {
                  exportAssetsPdf(exportRows, statusFilter);
                  toast.success(`PDF report generated (${exportRows.length} assets)`);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all duration-150 active:scale-95"
              >
                <FileText className="size-3.5" />
                <span>PDF</span>
              </button>

              {/* Excel */}
              <button
                type="button"
                onClick={() => {
                  exportAssetsExcel(exportRows, statusFilter);
                  toast.success(`Excel report exported (${exportRows.length} assets)`);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all duration-150 active:scale-95"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Excel</span>
              </button>

              {/* CSV */}
              <button
                type="button"
                onClick={() => exportAssetsCsv(exportRows, statusFilter)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:bg-sky-600 hover:text-white transition-all duration-150 active:scale-95"
              >
                <Download className="size-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        
        {/* 1. Top KPI Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm hover:border-teal-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Fleet Assets
              </CardTitle>
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600">
                <Boxes className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{assets.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {activeAssetsCount} active units deployed
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-blue-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Stock Reserve
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Package className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stockAssetsCount}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Available for assignment</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-cyan-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Maintenance Tickets
              </CardTitle>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600">
                <Wrench className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{maintenance.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Total service jobs recorded</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-emerald-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Maintenance Expense
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Coins className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                EGP {totalCost.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Total hardware repair cost</p>
            </CardContent>
          </Card>
        </div>

        {/* 2. Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/80 bg-card p-1 shadow-sm overflow-hidden">
            <DonutChartCard title="Asset Status Breakdown" data={statusData(assets)} />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-1 shadow-sm overflow-hidden">
            <BarChartCard title="Assets by Location" data={locationData(assets)} />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-1 shadow-sm overflow-hidden">
            <BarChartCard title="Assets by Hardware Type" data={typeData(assets)} color="var(--chart-3)" />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-1 shadow-sm overflow-hidden">
            <LineChartCard
              title="Maintenance Cost Over Time (EGP)"
              data={maintenanceCostMonthly(maintenance)}
            />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

export default ReportsPage;