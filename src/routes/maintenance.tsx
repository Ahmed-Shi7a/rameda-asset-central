import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { NoAccess } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/lib/app-context";
import type { MaintenanceRecord } from "@/lib/types";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance Log — AssetFlow" },
      {
        name: "description",
        content: "Log and track device maintenance jobs, descriptions and optional costs in EGP.",
      },
      { property: "og:title", content: "Maintenance Log — AssetFlow" },
      {
        property: "og:description",
        content: "Track repairs and service history for every asset.",
      },
    ],
  }),
  component: MaintenancePage,
});

function MaintenancePage() {
  const { maintenance, assets, can, addMaintenance, updateMaintenance, deleteMaintenance } =
    useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRecord | null>(null);
  const [draft, setDraft] = useState({ assetName: "", date: "", description: "", cost: "" });
  const [assetQuery, setAssetQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return maintenance;
    return maintenance.filter((m) =>
      [m.id, m.assetName, m.description].join(" ").toLowerCase().includes(q),
    );
  }, [maintenance, query]);

  const assetOptions = useMemo(() => {
    const q = assetQuery.trim().toLowerCase();
    const names = Array.from(new Set(assets.map((a) => a.name)));
    return q ? names.filter((n) => n.toLowerCase().includes(q)).slice(0, 6) : names.slice(0, 6);
  }, [assets, assetQuery]);

  const totalCost = maintenance.reduce((sum, m) => sum + (m.cost ?? 0), 0);

  if (!can("maintenance.view")) {
    return (
      <AppLayout title="Maintenance">
        <NoAccess feature="view maintenance records" />
      </AppLayout>
    );
  }

  function openEdit(record: MaintenanceRecord) {
    setEditing(record);
    setDraft({
      assetName: record.assetName,
      date: record.date,
      description: record.description,
      cost: record.cost != null ? String(record.cost) : "",
    });
    setAssetQuery(record.assetName);
    setOpen(true);
  }

  function submit() {
    if (!draft.assetName.trim() || !draft.date) {
      toast.error("Asset name and maintenance date are required.");
      return;
    }
    const cost = draft.cost.trim() === "" ? undefined : Number(draft.cost);
    if (cost !== undefined && !Number.isFinite(cost)) {
      toast.error("Cost must be a number.");
      return;
    }
    const payload = {
      assetName: draft.assetName.trim(),
      date: draft.date,
      description: draft.description.trim(),
      cost,
    };
    if (editing) {
      updateMaintenance({ ...editing, ...payload });
      toast.success("Maintenance updated");
    } else {
      addMaintenance(payload);
      toast.success("Maintenance added");
    }
    setOpen(false);
  }

  return (
    <AppLayout
      title="Maintenance"
      description={`${maintenance.length} records · Total cost EGP ${totalCost.toLocaleString()}`}
    >
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search maintenance records…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record ID</TableHead>
                <TableHead>Asset name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.id}</TableCell>
                  <TableCell className="font-medium">{m.assetName}</TableCell>
                  <TableCell>{m.date}</TableCell>
                  <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                    {m.description || "—"}
                  </TableCell>
                  <TableCell>
                    {m.cost != null ? `EGP ${m.cost.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {can("maintenance.edit") ? (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                          <Pencil className="size-4" />
                        </Button>
                      ) : null}
                      {can("maintenance.delete") ? (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(m)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No maintenance records found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.id}` : "Add Maintenance"}</DialogTitle>
            <DialogDescription>
              Pick an existing asset or type a custom name for equipment not yet registered.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assetName">Asset name</Label>
              <Input
                id="assetName"
                placeholder="Search assets or type a custom name…"
                value={assetQuery}
                onChange={(e) => {
                  setAssetQuery(e.target.value);
                  setDraft((d) => ({ ...d, assetName: e.target.value }));
                }}
              />
              <div className="flex flex-wrap gap-2">
                {assetOptions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setAssetQuery(name);
                      setDraft((d) => ({ ...d, assetName: name }));
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary"
                  >
                    {name}
                  </button>
                ))}
                {assetQuery.trim() && !assetOptions.includes(assetQuery.trim()) ? (
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, assetName: assetQuery.trim() }))}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                  >
                    Use "{assetQuery.trim()}"
                  </button>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Maintenance date</Label>
              <Input
                id="date"
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (EGP) — optional</Label>
              <Input
                id="cost"
                inputMode="numeric"
                placeholder="e.g. 1500"
                value={draft.cost}
                onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? "Save changes" : "Add maintenance"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete maintenance record</DialogTitle>
            <DialogDescription>
              {deleteTarget?.id} — {deleteTarget?.assetName}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteMaintenance(deleteTarget.id);
                setDeleteTarget(null);
                toast.success("Record deleted");
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