import { type AssetStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: AssetStatus;
  className?: string;
}

const STATUS_CONFIG: Record<AssetStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  "Active": {
    label: "Active (Assigned)",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  "Stock - New": {
    label: "Stock (New)",
    bg: "bg-teal-500/10",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-500/25",
    dot: "bg-teal-500",
  },
  "Stock - Used": {
    label: "Stock (Used)",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/25",
    dot: "bg-amber-500",
  },
  "Under Maintenance": {
    label: "In Maintenance",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/25",
    dot: "bg-blue-500",
  },
  "Scrapped": {
    label: "Scrapped",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/25",
    dot: "bg-rose-500",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Stock - New"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`size-1.5 rounded-full animate-pulse ${config.dot}`} />
      {config.label}
    </span>
  );
}