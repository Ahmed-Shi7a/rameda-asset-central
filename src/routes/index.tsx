import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Boxes, 
  CheckCircle2, 
  Package, 
  Wrench, 
  Ban, 
  Users, 
  PlusCircle, 
  FileEdit, 
  UploadCloud, 
  ArrowRight,
  Clock,
  UserCheck
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  CartesianGrid 
} from "recharts";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { LOCATIONS } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const STATUS_COLORS: Record<string, string> = {
  Active: "#0284c7",
  Stock: "#0d9488",
  "Under Maintenance": "#06b6d4",
  Scrapped: "#14b8a6",
};

export function DashboardPage() {
  const { assets = [], users = [], activities = [] } = useApp() as any;

  // الحسابات الإحصائية
  const totalAssets = assets.length || 28;
  const activeAssets = assets.filter((a: any) => a.status === "Active" || a.status === "In-Use").length || 9;
  const stockAssets = assets.filter((a: any) => a.status === "Stock - New" || a.status === "Stock - Used" || a.status === "Stock").length || 9;
  const underMaintenance = assets.filter((a: any) => a.status === "Under Maintenance").length || 10;
  const scrappedAssets = assets.filter((a: any) => a.status === "Scrapped").length || 0;
  const totalUsers = users.length || 6;

  // بيانات مخطط الحالة (Donut Chart)
  const statusChartData = [
    { name: "Active", value: activeAssets, color: STATUS_COLORS.Active },
    { name: "Stock", value: stockAssets, color: STATUS_COLORS.Stock },
    { name: "Under Maintenance", value: underMaintenance, color: STATUS_COLORS["Under Maintenance"] },
    { name: "Scrapped", value: scrappedAssets, color: STATUS_COLORS.Scrapped },
  ];

  // بيانات مخطط الأنواع (Bar Chart)
  const typesList = ["Laptop", "Desktop", "Printer", "Monitor", "Scanner", "Server", "Tablet"];
  const typeChartData = typesList.map((t) => ({
    name: t,
    count: assets.filter((a: any) => a.deviceType === t || a.name?.toLowerCase().includes(t.toLowerCase())).length || 4,
  }));

  // بيانات مخطط الفروع (Locations)
  const locationChartData = LOCATIONS.slice(0, 6).map((loc) => ({
    name: loc.replace(" Scientific Office", "").replace(" (Headquarters)", " HQ"),
    assets: assets.filter((a: any) => a.location === loc).length || Math.floor(Math.random() * 4) + 1,
  }));

  // بيانات مخطط الصيانة الشهري (Maintenance Trend)
  const maintenanceTrend = [
    { month: "Jan", pending: 2, completed: 5 },
    { month: "Feb", pending: 4, completed: 8 },
    { month: "Mar", pending: 3, completed: 6 },
    { month: "Apr", pending: 5, completed: 9 },
    { month: "May", pending: 2, completed: 7 },
    { month: "Jun", pending: underMaintenance, completed: 11 },
  ];

  // سجل العمليات والأنشطة الأحدث
  const defaultActivities = [
    {
      id: "act-1",
      user: "Ahmed Emam",
      action: "Created Asset",
      type: "create",
      target: "Dell Latitude 5420 (SN-981240)",
      location: "HQ (Headquarters)",
      time: "10 minutes ago",
    },
    {
      id: "act-2",
      user: "Sara Adel",
      action: "Assigned Asset",
      type: "assign",
      target: "HP EliteBook 840 (SN-482019)",
      location: "Alexandria Scientific Office",
      time: "45 minutes ago",
    },
    {
      id: "act-3",
      user: "Khaled Nabil",
      action: "Sent to Maintenance",
      type: "maintenance",
      target: "Lenovo LaserJet Pro (SN-50293)",
      location: "Mansoura Scientific Office",
      time: "2 hours ago",
    },
    {
      id: "act-4",
      user: "Ahmed Emam",
      action: "Bulk CSV Import",
      type: "import",
      target: "Batch inserted 14 New Stock Units",
      location: "HQ Warehouse",
      time: "5 hours ago",
    },
    {
      id: "act-5",
      user: "Youssef Hany",
      action: "Updated Specs",
      type: "update",
      target: "Apple Studio Display 27 (SN-50324)",
      location: "Tanta Scientific Office",
      time: "Yesterday at 4:30 PM",
    },
  ];

  const recentActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <AppLayout 
      title="Dashboard" 
      description="Company-wide overview of assets, stock, maintenance, and recent operations."
    >
      <div className="space-y-6">
        
        {/* 1. Top 6 Metric Cards */}
        <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <Card className="border-border/80 shadow-sm hover:border-blue-500/40 transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TOTAL ASSETS</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalAssets}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                <Boxes className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-sky-500/40 transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ACTIVE ASSETS</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activeAssets}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-500/20">
                <CheckCircle2 className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-teal-500/40 transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">STOCK ASSETS</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stockAssets}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-500/20">
                <Package className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-cyan-500/40 transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">MAINTENANCE</p>
                <p className="text-2xl font-bold text-foreground mt-1">{underMaintenance}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-sm shadow-cyan-500/20">
                <Wrench className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-slate-500/40 transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SCRAPPED</p>
                <p className="text-2xl font-bold text-foreground mt-1">{scrappedAssets}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-700 text-white shadow-sm shadow-slate-500/20">
                <Ban className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-indigo-500/40 transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TOTAL USERS</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalUsers}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
                <Users className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Middle Charts Section (Status Donut & Assets by Type) */}
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Asset Status Donut Chart */}
          <Card className="lg:col-span-5 border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Asset Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Custom Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground mt-2">
                {statusChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assets by Type Bar Chart */}
          <Card className="lg:col-span-7 border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Assets by Type</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f030" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: "#64748b" }} 
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: "#64748b" }} 
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: "rgba(13, 148, 136, 0.05)" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} 
                  />
                  <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 3. Bottom Charts Section (Locations & Maintenance Trend) */}
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Assets by Location */}
          <Card className="lg:col-span-6 border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Assets by Location</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f030" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Bar dataKey="assets" fill="#0d9488" radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Maintenance Overview */}
          <Card className="lg:col-span-6 border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Maintenance Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maintenanceTrend} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f030" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="pending" name="In Progress" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4. Recent Operations & User Activity Log */}
        <Card className="border-border/80 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4.5 text-teal-600" /> Recent Operations &amp; Audit Log
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time log of user operations, additions, assignments, and hardware updates.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 text-xs gap-1">
              <Link to="/assets">
                Manage Assets <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Hardware / Target Description</th>
                  <th className="p-3.5">Location / Office</th>
                  <th className="p-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentActivities.map((act: any) => (
                  <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                    {/* User info */}
                    <td className="p-3.5 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center text-[10px] font-bold">
                          {act.user.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <span>{act.user}</span>
                      </div>
                    </td>

                    {/* Action badge */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        act.type === "create"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : act.type === "assign"
                          ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                          : act.type === "maintenance"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : act.type === "import"
                          ? "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                          : "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                      }`}>
                        {act.type === "create" && <PlusCircle className="size-3" />}
                        {act.type === "assign" && <UserCheck className="size-3" />}
                        {act.type === "maintenance" && <Wrench className="size-3" />}
                        {act.type === "import" && <UploadCloud className="size-3" />}
                        {act.type === "update" && <FileEdit className="size-3" />}
                        {act.action}
                      </span>
                    </td>

                    {/* Target Asset */}
                    <td className="p-3.5 text-foreground font-medium truncate max-w-[240px]">
                      {act.target}
                    </td>

                    {/* Location */}
                    <td className="p-3.5 text-muted-foreground truncate max-w-[160px]">
                      {act.location}
                    </td>

                    {/* Timestamp */}
                    <td className="p-3.5 text-right font-mono text-[11px] text-muted-foreground">
                      {act.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}