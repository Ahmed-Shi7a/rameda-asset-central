import { createFileRoute } from "@tanstack/react-router";
import { Ban, Eye, Pencil, Plus, Search, Trash2, Wrench, Laptop } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { NoAccess, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddAssetDialog } from "@/components/AddAssetDialog";
import { useApp } from "@/lib/app-context";
import { formatDate, getWarrantyInfo } from "@/lib/warranty";
import {
  ASSET_STATUSES,
  DEVICE_TYPES,
  LOCATIONS,
  type Asset,
  type AssetStatus,
} from "@/lib/types";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Assets Inventory — AssetFlow" },
      {
        name: "description",
        content:
          "Browse, filter and manage IT assets with specs, location and assigned holder.",
      },
      { property: "og:title", content: "Assets Inventory — AssetFlow" },
      {
        property: "og:description",
        content: "Search and manage every device across HQ and regional scientific offices.",
      },
    ],
  }),
  component: AssetsPage,
});

function AssetsPage() {
  const { assets, can, addAsset, updateAsset, deleteAsset, moveAssetToMaintenance, disposeAsset } =
    useApp();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [specsOf, setSpecsOf] = useState<Asset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [disposeTarget, setDisposeTarget] = useState<Asset | null>(null);
  const [disposeReason, setDisposeReason] = useState("");
  const [disposeError, setDisposeError] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      const matchQ =
        !q ||
        [a.id, a.name, a.model, a.serialNumber, a.holderName, a.holderEmployeeId, a.barcode]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return (
        matchQ &&
        (type === "all" || a.deviceType === type) &&
        (status === "all" || a.status === status) &&
        (location === "all" || a.location === location)
      );
    });
  }, [assets, query, type, status, location]);

  if (!can("assets.view")) {
    return (
      <AppLayout title="Assets">
        <NoAccess feature="view assets" />
      </AppLayout>
    );
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(asset: Asset) {
    setEditing(asset);
    setFormOpen(true);
  }

  function handleSubmit(payload: Omit<Asset, "id" | "barcode">) {
    if (editing) {
      updateAsset({ ...editing, ...payload });
      toast.success("Asset updated successfully");
    } else {
      addAsset(payload);
      toast.success("Asset added successfully");
    }
    setFormOpen(false);
  }

  return (
    <AppLayout
      title="Assets Inventory"
      description="Manage and track IT devices across HQ and all regional scientific offices."
      actions={
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden sm:inline-flex px-3 py-1 font-medium text-xs text-muted-foreground border-border/80">
            {filtered.length} / {assets.length} Total Devices
          </Badge>
          {can("assets.add") && (
            <Button onClick={openAdd} className="gap-1.5 shadow-sm">
              <Plus className="size-4" /> Add Asset
            </Button>
          )}
        </div>
      }
    >
      {/* Search & Filter Toolbar */}
      <Card className="shadow-sm border-border/70 mb-5">
        <CardContent className="p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 h-9 text-sm"
                placeholder="Search ID, model, serial, employee…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <FilterSelect value={type} onChange={setType} label="Device Type" options={DEVICE_TYPES} />
            <FilterSelect value={status} onChange={setStatus} label="Status" options={ASSET_STATUSES} />
            <FilterSelect value={location} onChange={setLocation} label="Location" options={LOCATIONS} />
          </div>
        </CardContent>
      </Card>

      {/* Main Assets Table */}
      <Card className="shadow-sm border-border/70">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[110px]">Asset ID</TableHead>
                <TableHead>Asset / Model</TableHead>
                <TableHead>Device Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned Holder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold text-primary">{a.id}</TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.model || a.brand || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-xs font-medium text-muted-foreground">
                      {a.deviceType}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{a.location}</TableCell>
                  <TableCell>
                    {a.holderName ? (
                      <div>
                        <p className="font-medium text-xs">{a.holderName}</p>
                        <p className="text-[11px] text-muted-foreground">#{a.holderEmployeeId || "N/A"}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/70 italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setSpecsOf(a)} title="View Specs">
                        <Eye className="size-4" />
                      </Button>
                      {can("assets.edit") && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(a)} title="Edit Asset">
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {can("maintenance.add") && a.status !== "Under Maintenance" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          title="Move to Maintenance"
                          aria-label="Move to Maintenance"
                          onClick={() => {
                            moveAssetToMaintenance(a);
                            toast.success(`${a.name} transferred to maintenance`);
                          }}
                        >
                          <Wrench className="size-4" />
                        </Button>
                      )}
                      {can("assets.edit") && a.status !== "Scrapped" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Scrap / Dispose Asset"
                          aria-label="Scrap / Dispose Asset"
                          onClick={() => {
                            setDisposeTarget(a);
                            setDisposeReason("");
                            setDisposeError(false);
                          }}
                        >
                          <Ban className="size-4" />
                        </Button>
                      )}
                      {can("assets.delete") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(a)}
                          title="Delete Asset"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Laptop className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    No assets found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Asset Wizard Modal */}
      <AddAssetDialog
        open={formOpen}
        asset={editing}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />

      {/* Specifications Details Dialog */}
      <Dialog open={!!specsOf} onOpenChange={(o) => !o && setSpecsOf(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{specsOf?.name}</DialogTitle>
            <DialogDescription>
              {specsOf?.id} · Barcode: {specsOf?.barcode || "N/A"}
            </DialogDescription>
          </DialogHeader>
          {specsOf ? <WarrantyPanel asset={specsOf} /> : null}
          <dl className="grid grid-cols-2 gap-3 text-sm mt-2">
            {specsOf
              ? detailRows(specsOf).map(([k, v]) => (
                  <div key={k} className="rounded-md bg-muted/30 p-2 border border-border/50">
                    <dt className="text-[11px] text-muted-foreground font-medium uppercase">{k}</dt>
                    <dd className="font-semibold text-xs mt-0.5 break-words">{v || "—"}</dd>
                  </div>
                ))
              : null}
          </dl>
        </DialogContent>
      </Dialog>

      {/* Disposal Dialog */}
      <Dialog
        open={!!disposeTarget}
        onOpenChange={(o) => {
          if (!o) {
            setDisposeTarget(null);
            setDisposeError(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dispose / Scrap Asset</DialogTitle>
            <DialogDescription>
              Mark asset as scrapped and release assigned employee holder.
            </DialogDescription>
          </DialogHeader>
          {disposeTarget && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="font-mono text-xs text-muted-foreground">{disposeTarget.id}</p>
              <p className="font-semibold">{disposeTarget.name}</p>
              <p className="text-xs text-muted-foreground">
                {disposeTarget.deviceType} · {disposeTarget.model}
              </p>
            </div>
          )}
          <div className="space-y-2 mt-2">
            <Label className="text-xs font-semibold">
              Reason for Scrap / Disposal <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={3}
              placeholder="Provide reason (e.g. damaged motherboard, unrepairable screen)..."
              value={disposeReason}
              onChange={(e) => {
                setDisposeReason(e.target.value);
                if (e.target.value.trim()) setDisposeError(false);
              }}
              aria-invalid={disposeError}
            />
            {disposeError && (
              <p className="text-xs text-destructive">Disposal reason is required.</p>
            )}
          </div>
          <DialogFooter className="mt-3">
            <Button variant="secondary" onClick={() => setDisposeTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!disposeReason.trim()) {
                  setDisposeError(true);
                  return;
                }
                if (disposeTarget) {
                  disposeAsset(disposeTarget, disposeReason.trim());
                  toast.success(`${disposeTarget.id} marked as scrapped`);
                }
                setDisposeTarget(null);
              }}
            >
              Confirm Disposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Asset Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteTarget?.id} ({deleteTarget?.name})? This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteAsset(deleteTarget.id);
                setDeleteTarget(null);
                toast.success("Asset permanently deleted");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: readonly string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}s</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function detailRows(a: Asset): [string, string][] {
  const base: [string, string][] = [
    ["Device type", a.deviceType],
    ["Brand", a.brand],
    ["Model", a.model],
    ["Serial number", a.serialNumber],
    ["Location", a.location],
    ["Holder", a.holderName || "Unassigned"],
    ["Holder ID", a.holderEmployeeId || "—"],
    ["Supplier", a.supplier],
    ["Delivery date", a.deliveryDate || "—"],
    ["Manufacturing date", a.manufacturingDate || "—"],
    ["Warranty period", a.warranty],
  ];

  const specs: [string, string][] = (() => {
    switch (a.deviceType) {
      case "Tablet":
        return [
          ["IMEI number", a.imei ?? ""],
          ["Storage capacity", a.memory],
          ["RAM", a.ram],
          ["Screen size", a.screenSize ?? ""],
          ["Connectivity", a.connectivity ?? ""],
        ];
      case "Printer":
        return [
          ["Printer type", a.printerType ?? ""],
          ["Print color", a.printOutput ?? ""],
          ["Connectivity", a.connectivity ?? ""],
          ["Cartridge / toner model", a.cartridgeModel ?? ""],
        ];
      case "Scanner":
        return [
          ["Scan resolution", a.scanResolution ?? ""],
          ["Scanner type", a.scannerType ?? ""],
          ["Connectivity", a.connectivity ?? a.interfaceType ?? ""],
        ];
      case "Network Device":
        return [
          ["Device category", a.networkCategory ?? ""],
          ["Port count", a.portCount ?? ""],
          ["Management type", a.managementType ?? ""],
          ["IP / MAC address", a.ipMacAddress ?? ""],
        ];
      case "Server":
        return [
          ["CPU / core count", a.processor],
          ["RAM", a.ram],
          ["Storage / RAID", a.raidConfig ?? ""],
          ["Form factor", a.formFactor ?? ""],
          ["Operating system", a.operatingSystem ?? ""],
          ["Static IP address", a.staticIp ?? ""],
        ];
      case "Monitor":
        return [
          ["Screen size", a.screenSize ?? ""],
          ["Resolution", a.resolution ?? ""],
          ["Panel type", a.panelType ?? ""],
          ["Display ports", a.displayPorts ?? ""],
        ];
      case "Other":
        return [["Description / notes", a.notes ?? ""]];

      default:
        return [
          ["Processor (CPU)", a.processor],
          ["RAM", a.ram],
          ["Hard disk type", a.hardDiskType],
          ["Storage capacity", a.memory],
          ["Graphic card (GPU)", a.gpu ?? ""],
        ];
    }
  })();

  return [...base, ...specs];
}

function WarrantyPanel({ asset }: { asset: Asset }) {
  const info = getWarrantyInfo(asset);
  return (
    <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Warranty Status</p>
          <p className="text-sm font-medium">
            {asset.warranty} · expires {formatDate(info.expiry)}
          </p>
        </div>
        <span
          className={
            info.expiry && info.active
              ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              : info.expiry
                ? "rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive"
                : "rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
          }
        >
          {info.label}
        </span>
      </div>
    </div>
  );
}