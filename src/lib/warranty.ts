import type { Asset } from "./types";

export interface WarrantyInfo {
  start: Date | null;
  expiry: Date | null;
  months: number | null;
  active: boolean;
  days: number;
  label: string;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function warrantyMonths(warranty?: string): number | null {
  if (!warranty) return null;
  const text = warranty.toLowerCase();
  if (text.includes("expired")) return 0;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return null;
  return text.includes("month") ? n : n * 12;
}

function humanizeRemaining(days: number): string {
  if (days >= 60) {
    const months = Math.round(days / 30.44);
    return `${months} month${months === 1 ? "" : "s"} left`;
  }
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

export function getWarrantyInfo(
  asset: Pick<Asset, "warranty" | "deliveryDate" | "manufacturingDate">,
  now: Date = new Date(),
): WarrantyInfo {
  const start = parseDate(asset.deliveryDate) ?? parseDate(asset.manufacturingDate);
  const months = warrantyMonths(asset.warranty);

  if (!start || months === null) {
    return {
      start,
      expiry: null,
      months,
      active: false,
      days: 0,
      label: asset.warranty?.toLowerCase().includes("expired")
        ? "Expired"
        : "No warranty data",
    };
  }

  const expiry = new Date(start);
  expiry.setMonth(expiry.getMonth() + months);

  const msPerDay = 86_400_000;
  const days = Math.ceil((expiry.getTime() - now.getTime()) / msPerDay);
  const active = days > 0;

  return {
    start,
    expiry,
    months,
    active,
    days: Math.abs(days),
    label: active
      ? `Active · ${humanizeRemaining(days)}`
      : `Expired · ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`,
  };
}

export function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toISOString().slice(0, 10);
}
