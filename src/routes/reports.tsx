import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Boxes, 
  Coins, 
  Package, 
  Wrench,
  TrendingUp,
  BarChart3,
  Loader2
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
  const [realStats, setRealStats] = useState<any>(null);
  
  // حالة التحميل أثناء التصدير
  const [exportingFormat, setExportingFormat] = useState<"pdf" | "excel" | "csv" | null>(null);

  const exportRows: Asset[] =
    statusFilter === "all" ? assets : assets.filter((a: any) => a.status === statusFilter);

  /* ========================================================================= */
  /* 🚨 FETCH REAL ANALYTICS FROM BACKEND 🚨 */
  /* ========================================================================= */
  /*
  useEffect(() => {
    async function fetchReportAnalytics() {
      try {
        const res = await fetch("https://api.yourdomain.com/api/reports/analytics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (!res.ok) throw new Error("Failed to fetch report analytics");
        const data = await res.json();
        setRealStats(data);
      } catch (error) {
        console.error("Reports fetch error:", error);
      }
    }
    fetchReportAnalytics();
  }, []);
  */

  if (typeof can === "function" && !can("reports.view")) {
    return (
      <AppLayout title="Reports">
        <NoAccess feature="view reports" />
      </AppLayout>
    );
  }

  /* ========================================================================= */
  /* 🟢 FRONTEND MOCK MODE CALCULATIONS 🟢 */
  /* ========================================================================= */
  const localTotalCost = maintenance.reduce((sum: number, m: any) => sum + (m.cost ?? 0), 0);
  const localStockCount = assets.filter(
    (a: any) => a.status === "Stock" || a.status === "Stock - New" || a.status === "Stock - Used"
  ).length;
  const localActiveCount = assets.filter((a: any) => a.status === "Active" || a.status === "In-Use").length;

  const displayTotalCost = realStats?.totalCost ?? localTotalCost;
  const displayStockCount = realStats?.stockAssetsCount ?? localStockCount;
  const displayActiveCount = realStats?.activeAssetsCount ?? localActiveCount;

  const displayStatusData = realStats?.statusData ?? statusData(assets);
  const displayLocationData = realStats?.locationData ?? locationData(assets);
  const displayTypeData = realStats?.typeData ?? typeData(assets);
  const displayMaintenanceCost = realStats?.maintenanceCostMonthly ?? maintenanceCostMonthly(maintenance);

  // دالة التصدير للـ CSV من الفرونت إند
  function exportAssetsCsv(rows: Asset[], status: string) {
    if (rows.length === 0) {
      toast.error("No assets available to export.");
      return;
    }
    const headers = ["Asset ID", "Asset Name", "Device Type", "Brand", "Model", "Serial Number", "Status", "Location", "Assigned To", "Delivery Date"];
    const csvContentRows = rows.map((a: any) => [
      `"${a.id || ""}"`, `"${a.name || ""}"`, `"${a.deviceType || ""}"`, `"${a.brand || ""}"`, `"${a.model || ""}"`, `"${a.serialNumber || ""}"`, `"${a.status || ""}"`, `"${a.location || ""}"`, `"${a.holderName || "Unassigned"}"`, `"${a.deliveryDate || ""}"`
    ]);
    const csvString = [headers.join(","), ...csvContentRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RAMEDA_Assets_${status}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /* ========================================================================= */
  /* 🛡️ نظام التصدير المزدوج (الباك إند أولاً، ثم الفرونت إند كخطة بديلة) 🛡️ */
  /* ========================================================================= */
  async function handleExport(format: "pdf" | "excel" | "csv") {
    if (exportRows.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    setExportingFormat(format);

    try {
      /* 🚨 محاولة تصدير الملف من الباك إند (لو مبرمجينها) 🚨 */
      // TODO: BACKEND TEAM - REPLACE URL WITH REAL EXPORT ENDPOINT
      const response = await fetch(`https://api.yourdomain.com/api/export?format=${format}&status=${statusFilter}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });

      if (!response.ok) {
        throw new Error("Backend export not available or failed."); // هيحولنا للخطوة اللي بعدها
      }

      // لو الباك إند رد بملف، هنحمله للمستخدم
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RAMEDA_Report_${format}.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${format.toUpperCase()} exported from server successfully!`);

    } catch (error) {
      /* 🟢 الخطة البديلة: لو الباك إند فشل، الفرونت إند هيطبع الملف فوراً 🟢 */
      console.log(`Backend export failed, falling back to frontend for ${format}...`);
      
      if (format === "pdf") {
        exportAssetsPdf(exportRows, statusFilter);
      } else if (format === "excel") {
        exportAssetsExcel(exportRows, statusFilter);
      } else if (format === "csv") {
        exportAssetsCsv(exportRows, statusFilter);
      }

      toast.success(`${format.toUpperCase()} generated locally successfully!`);
    } finally {
      setExportingFormat(null);
    }
  }

  return (
    <AppLayout
      title="Reports & Analytics"
      description="Real-time analytics across inventory status, locations, device categories, and maintenance expenses."
      actions={
        typeof can === "function" && can("reports.export") ? (
          <div className="flex flex-wrap items-center gap-2.5">
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

            {/* أزرار التصدير الذكية (تدمج بين الباك والفرونت) */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card p-1 shadow-sm">
              
              {/* PDF Button */}
              <button
                type="button"
                disabled={exportingFormat !== null}
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all duration-150 active:scale-95 disabled:opacity-50"
              >
                {exportingFormat === "pdf" ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
                <span>PDF</span>
              </button>

              {/* Excel Button */}
              <button
                type="button"
                disabled={exportingFormat !== null}
                onClick={() => handleExport("excel")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all duration-150 active:scale-95 disabled:opacity-50"
              >
                {exportingFormat === "excel" ? <Loader2 className="size-3.5 animate-spin" /> : <FileSpreadsheet className="size-3.5" />}
                <span>Excel</span>
              </button>

              {/* CSV Button */}
              <button
                type="button"
                disabled={exportingFormat !== null}
                onClick={() => handleExport("csv")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:bg-sky-600 hover:text-white transition-all duration-150 active:scale-95 disabled:opacity-50"
              >
                {exportingFormat === "csv" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
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
                {displayActiveCount} active units deployed
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
              <div className="text-2xl font-bold text-foreground">{displayStockCount}</div>
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
                EGP {displayTotalCost.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Total hardware repair cost</p>
            </CardContent>
          </Card>
        </div>

        {/* 2. Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/80 bg-card p-1 shadow-sm overflow-hidden">
            <DonutChartCard title="Asset Status Breakdown" data={displayStatusData} />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-1 shadow-sm overflow-hidden">
            <BarChartCard title="Assets by Location" data={displayLocationData} />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-1 shadow-sm overflow-hidden">
            <BarChartCard title="Assets by Hardware Type" data={displayTypeData} color="var(--chart-3)" />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-1 shadow-sm overflow-hidden">
            <LineChartCard
              title="Maintenance Cost Over Time (EGP)"
              data={displayMaintenanceCost}
            />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

export default ReportsPage;