import type { Asset, MaintenanceRecord } from "./types";

export interface Datum {
  name: string;
  value: number;
}

function countBy(items: Asset[], key: keyof Asset): Datum[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const raw = String(item[key] ?? "—") || "—";
    map.set(raw, (map.get(raw) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function statusData(assets: Asset[]): Datum[] {
  return ["Active", "Stock", "Under Maintenance", "Scrapped"].map((status) => ({
    name: status,
    value: assets.filter((a) => a.status === status).length,
  }));
}

export function typeData(assets: Asset[]): Datum[] {
  return countBy(assets, "deviceType");
}

export function locationData(assets: Asset[]): Datum[] {
  const map = new Map<string, number>();
  for (const item of assets) {
    let loc = String(item.location ?? "—") || "—";
    // اختصار الأسماء الطويلة لمنع تداخل النصوص
    loc = loc
      .replace(" Scientific Office", "")
      .replace(" (Headquarters)", "")
      .replace(" Office", "")
      .trim();

    map.set(loc, (map.get(loc) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export function maintenanceMonthly(records: MaintenanceRecord[]): Datum[] {
  const map = new Map<string, number>();
  for (const r of records) {
    const month = (r.date || "").slice(0, 7) || "Unknown";
    map.set(month, (map.get(month) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function maintenanceCostMonthly(records: MaintenanceRecord[]): Datum[] {
  const map = new Map<string, number>();
  for (const r of records) {
    const month = (r.date || "").slice(0, 7) || "Unknown";
    map.set(month, (map.get(month) ?? 0) + (r.cost ?? 0));
  }
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}