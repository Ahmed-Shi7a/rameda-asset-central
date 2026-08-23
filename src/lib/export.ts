import type { Asset } from "./types";
import { formatDate, getWarrantyInfo } from "./warranty";

const COLUMNS: [string, (a: Asset) => string][] = [
  ["Asset ID", (a) => a.id],
  ["Barcode", (a) => a.barcode],
  ["Name", (a) => a.name],
  ["Device Type", (a) => a.deviceType],
  ["Brand", (a) => a.brand],
  ["Model", (a) => a.model],
  ["Serial Number", (a) => a.serialNumber],
  ["Location", (a) => a.location],
  ["Assigned Employee", (a) => a.holderName || "Unassigned"],
  ["Employee ID", (a) => a.holderEmployeeId || ""],
  ["Supplier", (a) => a.supplier],
  ["Delivery Date", (a) => a.deliveryDate],
  ["Manufacturing Date", (a) => a.manufacturingDate],
  ["Warranty Period", (a) => a.warranty],
  ["Warranty Expiry", (a) => formatDate(getWarrantyInfo(a).expiry)],
  ["Warranty Status", (a) => getWarrantyInfo(a).label],
  ["Status", (a) => a.status],
];

function fileLabel(statusFilter: string): string {
  return statusFilter === "all" ? "all-statuses" : statusFilter.toLowerCase().replace(/\s+/g, "-");
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportAssetsExcel(assets: Asset[], statusFilter: string) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    COLUMNS.map(([header]) => escape(header)).join(","),
    ...assets.map((a) => COLUMNS.map(([, get]) => escape(get(a) ?? "")).join(",")),
  ];
  download(
    `\uFEFF${rows.join("\r\n")}`,
    `assets-report-${fileLabel(statusFilter)}.csv`,
    "text/csv;charset=utf-8",
  );
}

export function exportAssetsPdf(assets: Asset[], statusFilter: string) {
  const escapeHtml = (value: string) =>
    value.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
  const title = `Assets Report — ${statusFilter === "all" ? "All Statuses" : statusFilter}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:24px;color:#111}
h1{font-size:18px;margin:0 0 4px}
p.meta{font-size:12px;color:#555;margin:0 0 16px}
table{width:100%;border-collapse:collapse;font-size:10px}
th,td{border:1px solid #ddd;padding:4px 6px;text-align:left}
th{background:#f3f4f6}
@page{size:A4 landscape;margin:12mm}
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<p class="meta">${assets.length} asset(s) · generated ${new Date().toLocaleString()}</p>
<table><thead><tr>${COLUMNS.map(([h]) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
<tbody>${assets
    .map(
      (a) => `<tr>${COLUMNS.map(([, get]) => `<td>${escapeHtml(get(a) ?? "")}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody></table>
<script>window.onload=function(){window.print()}</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
