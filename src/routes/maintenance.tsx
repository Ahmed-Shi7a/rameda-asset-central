import { createFileRoute } from "@tanstack/react-router";
import { 
  Pencil, 
  Search, 
  Trash2, 
  Wrench, 
  Coins, 
  Layers, 
  Calendar,
  AlertTriangle,
  FileText,
  Loader2
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { NoAccess } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useApp } from "@/lib/app-context";
import type { MaintenanceRecord } from "@/lib/types";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance Log — RAMEDA Central" },
      {
        name: "description",
        content: "Log and track device maintenance jobs, descriptions and optional costs in EGP.",
      },
      { property: "og:title", content: "Maintenance Log — RAMEDA Central" },
      {
        property: "og:description",
        content: "Track repairs and service history for every asset.",
      },
    ],
  }),
  component: MaintenancePage,
});

function MaintenancePage() {
  const { maintenance = [], assets = [], can, updateMaintenance, deleteMaintenance } =
    useApp() as any;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRecord | null>(null);
  const [draft, setDraft] = useState({ assetName: "", date: "", description: "", cost: "" });
  const [assetQuery, setAssetQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return maintenance;
    return maintenance.filter((m: MaintenanceRecord) =>
      [m.id, m.assetName, m.description].join(" ").toLowerCase().includes(q),
    );
  }, [maintenance, query]);

  const assetOptions = useMemo(() => {
    const q = assetQuery.trim().toLowerCase();
    const names = Array.from(new Set(assets.map((a: any) => a.name))).filter(Boolean) as string[];
    return q ? names.filter((n) => n.toLowerCase().includes(q)).slice(0, 6) : names.slice(0, 6);
  }, [assets, assetQuery]);

  const totalCost = maintenance.reduce((sum: number, m: MaintenanceRecord) => sum + (m.cost ?? 0), 0);
  const uniqueAssetsServiced = new Set(maintenance.map((m: MaintenanceRecord) => m.assetName)).size;
  const avgCost = maintenance.length > 0 ? Math.round(totalCost / maintenance.length) : 0;

  if (typeof can === "function" && !can("maintenance.view")) {
    return (
      <AppLayout title="Maintenance">
        <NoAccess feature="view maintenance records" />
      </AppLayout>
    );
  }

  // 🔐 التحقق من صلاحية التعديل قبل فتح نافذة التعديل
  function openEdit(record: MaintenanceRecord) {
    if (typeof can === "function" && !can("maintenance.edit")) {
      toast.error("You do not have permission to edit maintenance records.");
      return;
    }
    setEditing(record);
    setDraft({
      assetName: record.assetName,
      date: record.date,
      description: record.description || "",
      cost: record.cost != null ? String(record.cost) : "",
    });
    setAssetQuery(record.assetName);
    setOpen(true);
  }

  // =========================================================================
  // 1. UPDATE MAINTENANCE RECORD (API + MOCK FALLBACK)
  // =========================================================================
  async function submit() {
    if (typeof can === "function" && !can("maintenance.edit")) {
      toast.error("You do not have permission to update maintenance records.");
      return;
    }

    if (!draft.assetName.trim() || !draft.date) {
      toast.error("Asset name and maintenance date are required.");
      return;
    }
    const cost = draft.cost.trim() === "" ? undefined : Number(draft.cost);
    if (cost !== undefined && !Number.isFinite(cost)) {
      toast.error("Cost must be a valid numeric amount.");
      return;
    }
    
    const payload = {
      assetName: draft.assetName.trim(),
      date: draft.date,
      description: draft.description.trim(),
      cost,
    };

    setIsProcessing(true);

    if (editing) {
      /* 🚨🚨🚨 BACKEND TEAM: UNCOMMENT THIS BLOCK FOR REAL API INTEGRATION 🚨🚨🚨 */
      /*
      try {
        const response = await fetch(`https://api.yourdomain.com/api/maintenance/${editing.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to update maintenance record.");

        const updatedRecord = await response.json();
        if (typeof updateMaintenance === "function") {
          updateMaintenance(updatedRecord);
        }

        toast.success("Maintenance record updated successfully.");
        setOpen(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to update record.");
      } finally {
        setIsProcessing(false);
      }
      return;
      */

      /* 🟢🟢🟢 FRONTEND MOCK MODE 🟢🟢🟢 */
      setTimeout(() => {
        if (typeof updateMaintenance === "function") {
          updateMaintenance({ ...editing, ...payload });
          toast.success("Maintenance record updated successfully. (Mock Mode)");
        }
        setOpen(false);
        setIsProcessing(false);
      }, 500);
    }
  }

  // =========================================================================
  // 2. DELETE MAINTENANCE RECORD (API + MOCK FALLBACK)
  // =========================================================================
  async function handleDeleteRecord() {
    if (typeof can === "function" && !can("maintenance.delete")) {
      toast.error("You do not have permission to delete maintenance records.");
      setDeleteTarget(null);
      return;
    }

    if (!deleteTarget) return;

    setIsProcessing(true);

    /* 🚨🚨🚨 BACKEND TEAM: UNCOMMENT THIS BLOCK FOR REAL API 🚨🚨🚨 */
    /*
    try {
      const response = await fetch(`https://api.yourdomain.com/api/maintenance/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to delete maintenance record.");

      if (typeof deleteMaintenance === "function") {
        deleteMaintenance(deleteTarget.id);
      }

      toast.success("Maintenance record deleted.");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete record.");
    } finally {
      setIsProcessing(false);
    }
    return;
    */

    /* 🟢🟢🟢 FRONTEND MOCK MODE 🟢🟢🟢 */
    setTimeout(() => {
      if (typeof deleteMaintenance === "function") {
        deleteMaintenance(deleteTarget.id);
        toast.success("Maintenance record deleted. (Mock Mode)");
      }
      setDeleteTarget(null);
      setIsProcessing(false);
    }, 400);
  }

  // التحقق من الصلاحيات للعرض
  const canEdit = typeof can !== "function" || can("maintenance.edit");
  const canDelete = typeof can !== "function" || can("maintenance.delete");

  return (
    <AppLayout
      title="Maintenance Operations"
      description="Log and track hardware maintenance tickets, service descriptions, and repair costs in EGP."
    >
      <div className="space-y-5">
        
        {/* 1. Metric Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm hover:border-teal-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Service Jobs
              </CardTitle>
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600">
                <Wrench className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{maintenance.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Logged maintenance records</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-emerald-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Repair Cost
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Coins className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                EGP {totalCost.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Cumulative hardware expense</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-blue-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Serviced Assets
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Layers className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{uniqueAssetsServiced}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Unique hardware units repaired</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:border-amber-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Average Cost / Job
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <FileText className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                EGP {avgCost.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Average per maintenance ticket</p>
            </CardContent>
          </Card>
        </div>

        {/* 2. Search Bar */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-10 h-10 bg-muted/30 border-border/80 focus-visible:ring-teal-500 text-xs"
              placeholder="Search by ticket ID, asset name, or issue description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 3. Maintenance Records Table */}
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <th className="p-3.5">Record ID</th>
                  <th className="p-3.5">Asset Name</th>
                  <th className="p-3.5">Service Date</th>
                  <th className="p-3.5">Issue &amp; Description</th>
                  <th className="p-3.5">Cost</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Wrench className="size-8 text-muted-foreground/40" />
                        <p className="text-sm font-semibold text-foreground">No maintenance records found</p>
                        <p className="text-xs">Try adjusting your search keywords.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((m: MaintenanceRecord) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors group">
                      
                      {/* Ticket ID */}
                      <td className="p-3.5 font-bold font-mono text-teal-600 dark:text-teal-400">
                        {m.id}
                      </td>

                      {/* Asset Name */}
                      <td className="p-3.5 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-md bg-muted text-muted-foreground flex items-center justify-center border border-border/60">
                            <Wrench className="size-3" />
                          </div>
                          <span>{m.assetName}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Calendar className="size-3 text-muted-foreground/60" />
                          {m.date}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="p-3.5 text-muted-foreground max-w-[320px]">
                        {m.description ? (
                          <span className="line-clamp-2 text-foreground/80 font-medium">
                            {m.description}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 italic">No notes provided</span>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="p-3.5 whitespace-nowrap">
                        {m.cost != null && m.cost > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            EGP {m.cost.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 font-mono">—</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5 shadow-sm">
                          {/* 🔐 زر التعديل مرتبط بصلاحية maintenance.edit */}
                          {canEdit && (
                            <button
                              type="button"
                              title="Edit Maintenance Record"
                              onClick={() => openEdit(m)}
                              className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-teal-600 hover:bg-teal-500/10 dark:hover:text-teal-400 dark:hover:bg-teal-500/15 transition-colors"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                          )}

                          {/* 🔐 زر الحذف مرتبط بصلاحية maintenance.delete */}
                          {canDelete && (
                            <button
                              type="button"
                              title="Delete Record"
                              onClick={() => setDeleteTarget(m)}
                              className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg border-border/80 shadow-2xl">
          <DialogHeader className="pb-2 border-b border-border/60">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Wrench className="size-4.5 text-teal-600" />
              Edit Ticket: {editing?.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update maintenance details, repair notes, and cost.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Asset Name *
              </Label>
              <Input
                placeholder="Asset name..."
                disabled={isProcessing}
                value={assetQuery}
                onChange={(e) => {
                  setAssetQuery(e.target.value);
                  setDraft((d) => ({ ...d, assetName: e.target.value }));
                }}
                className="text-xs h-10"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {assetOptions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setAssetQuery(name);
                      setDraft((d) => ({ ...d, assetName: name }));
                    }}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                      draft.assetName === name
                        ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                        : "border-border/80 bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Maintenance Date *
              </Label>
              <Input
                type="date"
                disabled={isProcessing}
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                className="text-xs h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Issue Description / Work Done
              </Label>
              <Textarea
                rows={3}
                disabled={isProcessing}
                placeholder="e.g. Screen replacement, OS reload, RAM upgrade..."
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Repair Cost (EGP) — Optional
              </Label>
              <Input
                inputMode="numeric"
                disabled={isProcessing}
                placeholder="e.g. 1500"
                value={draft.cost}
                onChange={(e) => setDraft((d) => ({ ...d, cost: e.target.value }))}
                className="text-xs h-10"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 gap-2">
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={submit} 
              size="sm"
              disabled={isProcessing}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm"
            >
              {isProcessing ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5" /> Delete Maintenance Record
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete maintenance record <strong className="text-foreground">{deleteTarget?.id}</strong> for <strong className="text-foreground">{deleteTarget?.assetName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end pt-3 border-t border-border/60">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isProcessing}
              onClick={handleDeleteRecord}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              {isProcessing ? <Loader2 className="size-4 animate-spin" /> : "Delete Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}