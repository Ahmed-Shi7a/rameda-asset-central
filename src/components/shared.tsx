import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AssetStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: AssetStatus | "Active" | "Inactive" }) {
  const styles: Record<string, string> = {
    Active: "bg-success/15 text-success",
    Stock: "bg-info/20 text-info-foreground",
    "Under Maintenance": "bg-warning/20 text-warning-foreground",
    Scrapped: "bg-muted text-muted-foreground line-through decoration-muted-foreground/60",
    Inactive: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="shadow-card border-border/70">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="bg-brand-gradient grid size-11 shrink-0 place-items-center rounded-xl text-primary-foreground">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="text-2xl font-bold">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function NoAccess({ feature }: { feature: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-10 text-center">
        <p className="text-lg font-semibold">Access restricted</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You don't have permission to {feature}. Ask an administrator to enable it in your
          permission checklist.
        </p>
      </CardContent>
    </Card>
  );
}