import { createFileRoute } from "@tanstack/react-router";
import { Ban, Boxes, CheckCircle2, PackageOpen, Users, Wrench } from "lucide-react";

import { BarChartCard, DonutChartCard, LineChartCard } from "@/components/charts";
import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  locationData,
  maintenanceMonthly,
  statusData,
  typeData,
} from "@/lib/analytics";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AssetFlow — IT Asset Management Dashboard" },
      {
        name: "description",
        content:
          "Track assets, stock, maintenance and users across HQ and regional offices from one dashboard.",
      },
      { property: "og:title", content: "AssetFlow — IT Asset Management Dashboard" },
      {
        property: "og:description",
        content: "KPIs and charts for assets, stock levels and maintenance activity.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { assets, maintenance, users, activity, isAdmin, can, currentUser } = useApp();

  const active = assets.filter((a) => a.status === "Active").length;
  const stock = assets.filter((a) => a.status === "Stock").length;
  const underMaintenance = assets.filter((a) => a.status === "Under Maintenance").length;
  const scrapped = assets.filter((a) => a.status === "Scrapped").length;
  const myAssets = assets.filter(
    (a) => a.holderEmployeeId === String(currentUser.employeeId),
  ).length;

  return (
    <AppLayout
      title="Dashboard"
      description={
        isAdmin
          ? "Company-wide overview of assets, stock and maintenance."
          : "Your personalised overview based on granted access."
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Total Assets" value={assets.length} icon={<Boxes className="size-5" />} />
        <KpiCard label="Active Assets" value={active} icon={<CheckCircle2 className="size-5" />} />
        <KpiCard label="Stock Assets" value={stock} icon={<PackageOpen className="size-5" />} />
        <KpiCard
          label="Under Maintenance"
          value={underMaintenance}
          icon={<Wrench className="size-5" />}
        />
        <KpiCard
          label="Total Scrapped Assets"
          value={scrapped}
          icon={<Ban className="size-5" />}
        />
        {isAdmin ? (
          <KpiCard label="Total Users" value={users.length} icon={<Users className="size-5" />} />
        ) : (
          <KpiCard
            label="Assets Assigned To Me"
            value={myAssets}
            icon={<Users className="size-5" />}
          />
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DonutChartCard title="Asset Status" data={statusData(assets)} />
        <BarChartCard title="Assets by Type" data={typeData(assets)} />
        {isAdmin ? (
          <BarChartCard
            title="Assets by Location"
            data={locationData(assets)}
            color="var(--chart-4)"
          />
        ) : null}
        {can("maintenance.view") ? (
          <LineChartCard title="Maintenance Overview" data={maintenanceMonthly(maintenance)} />
        ) : null}
      </div>

      {isAdmin ? (
        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {activity.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>{item.message}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{item.at}</span>
                </li>
              ))}
              {activity.length === 0 ? (
                <li className="py-3 text-sm text-muted-foreground">No activity yet.</li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </AppLayout>
  );
}
