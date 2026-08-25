import { createFileRoute } from "@tanstack/react-router";
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  Wrench, 
  Ban, 
  Trash2, 
  Laptop, 
  User, 
  MapPin, 
  RotateCcw,
  SlidersHorizontal,
  AlertTriangle
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AddAssetDialog } from "@/components/AddAssetDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { 
  type Asset, 
  DEVICE_TYPES, 
  ASSET_STATUSES, 
  LOCATIONS 
} from "@/lib/types";

export const Route = createFileRoute("/assets")({
  component: AssetsPage,
});

function AssetsPage() {
  const appContext = useApp() as any;
  const { 
    assets = [], 
    addAsset, 
    updateAsset, 
    editAsset, 
    deleteAsset, 
    addMaintenanceRecord, 
    addMaintenanceJob,
    addMaintenance 
  } = appContext;

  // Add / Edit Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Scrap Modal State
  const [isScrapOpen, setIsScrapOpen] = useState(false);
  const [scrapTargetAsset, setScrapTargetAsset] = useState<Asset | null>(null);
  const [scrapReason, setScrapReason] = useState("");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const updateSingleAsset = (id: string, updatedFields: Partial<Asset>) => {
    const target = assets.find((a: Asset) => a.id === id) || {};
    const mergedAsset = { ...target, ...updatedFields, id };

    if (typeof updateAsset === "function") {
      try { updateAsset(id, mergedAsset); } catch (e) {}
      try { updateAsset(mergedAsset); } catch (e) {}
    }
    if (typeof editAsset === "function") {
      try { editAsset(id, mergedAsset); } catch (e) {}
      try { editAsset(mergedAsset); } catch (e) {}
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset: Asset) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.holderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.holderEmployeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "all" || asset.deviceType === selectedType;
      const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus;
      const matchesLocation = selectedLocation === "all" || asset.location === selectedLocation;

      return matchesSearch && matchesType && matchesStatus && matchesLocation;
    });
  }, [assets, searchQuery, selectedType, selectedStatus, selectedLocation]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedStatus("all");
    setSelectedLocation("all");
  };

  const handleSendToMaintenance = (asset: Asset) => {
    updateSingleAsset(asset.id, { status: "Under Maintenance" });

    const maintenanceData = {
      id: `MNT-${Date.now().toString().slice(-4)}`,
      assetId: asset.id,
      assetName: asset.name || `${asset.brand || ""} ${asset.model || ""}`.trim(),
      issue: "Routine checkup & repair from Assets Inventory",
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };

    if (typeof addMaintenanceRecord === "function") addMaintenanceRecord(maintenanceData);
    else if (typeof addMaintenanceJob === "function") addMaintenanceJob(maintenanceData);
    else if (typeof addMaintenance === "function") addMaintenance(maintenanceData);

    toast.success(`${asset.name} moved to Maintenance.`);
  };

  const handleOpenScrapDialog = (asset: Asset) => {
    setScrapTargetAsset(asset);
    setScrapReason("");
    setIsScrapOpen(true);
  };

  const handleConfirmScrap = () => {
    if (!scrapTargetAsset) return;
    if (!scrapReason.trim()) {
      toast.error("Please enter a reason for scrapping this asset.");
      return;
    }

    const updatedNotes = scrapTargetAsset.notes 
      ? `${scrapTargetAsset.notes} | [Scrapped]: ${scrapReason.trim()}` 
      : `[Scrapped]: ${scrapReason.trim()}`;

    updateSingleAsset(scrapTargetAsset.id, {
      status: "Scrapped",
      notes: updatedNotes,
    });

    toast.success(`${scrapTargetAsset.name} marked as Scrapped.`);
    setIsScrapOpen(false);
    setScrapTargetAsset(null);
    setScrapReason("");
  };

  const handleDelete = (asset: Asset) => {
    if (confirm(`Are you sure you want to delete ${asset.name} (${asset.serialNumber}) permanently?`)) {
      if (typeof deleteAsset === "function") {
        deleteAsset(asset.id);
        toast.success("Asset deleted permanently.");
      }
    }
  };

  const handleSaveAsset = (payload: Omit<Asset, "id" | "barcode">) => {
    if (selectedAsset) {
      updateSingleAsset(selectedAsset.id, payload);
      toast.success("Asset updated successfully.");
    } else {
      if (typeof addAsset === "function") {
        addAsset(payload);
        toast.success("Asset added to inventory.");
      }
    }
    setIsAddOpen(false);
    setSelectedAsset(null);
  };

  return (
    <AppLayout
      title="Assets Inventory"
      description="Manage and track enterprise assets across HQ and regional scientific offices."
      actions={
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border/60">
            {filteredAssets.length} / {assets.length} Total Devices
          </span>
          <Button
            onClick={() => {
              setSelectedAsset(null);
              setIsAddOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium gap-1.5 shadow-sm shadow-teal-600/20"
          >
            <Plus className="size-4" /> Add Asset
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        
        {/* Filters Bar */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            
            {/* Search Input */}
            <div className="relative lg:col-span-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search ID, model, serial, employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-muted/30 border-border/80 focus-visible:ring-teal-500 text-xs"
              />
            </div>

            {/* Device Type */}
            <div className="lg:col-span-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-10 bg-muted/30 border-border/80 text-xs">
                  <SelectValue placeholder="All Device Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Device Types</SelectItem>
                  {DEVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="lg:col-span-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 bg-muted/30 border-border/80 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ASSET_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="lg:col-span-3">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-10 bg-muted/30 border-border/80 text-xs">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedType !== "all" || selectedStatus !== "all" || selectedLocation !== "all") && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <span>Showing {filteredAssets.length} matching records</span>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                <RotateCcw className="size-3" /> Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Assets Table */}
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <th className="p-3.5">Asset ID</th>
                  <th className="p-3.5">Asset / Model</th>
                  <th className="p-3.5">Device Type</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Assigned Holder</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <SlidersHorizontal className="size-8 text-muted-foreground/40" />
                        <p className="text-sm font-semibold text-foreground">No assets found</p>
                        <p className="text-xs">Try adjusting your search criteria or clear the active filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset: Asset) => (
                    <tr key={asset.id} className="hover:bg-muted/30 transition-colors group">
                      
                      {/* Asset ID */}
                      <td className="p-3.5 font-bold font-mono text-teal-600 dark:text-teal-400">
                        {asset.id || "AST-1000"}
                      </td>

                      {/* Asset Name & Model */}
                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">{asset.name}</div>
                        <div className="text-[11px] text-muted-foreground font-normal">
                          {asset.brand} {asset.model} &bull; <span className="font-mono">{asset.serialNumber}</span>
                        </div>
                      </td>

                      {/* Device Type */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                          <Laptop className="size-3.5 text-muted-foreground" />
                          {asset.deviceType || "Laptop"}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="p-3.5 text-muted-foreground max-w-[180px] truncate" title={asset.location}>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 shrink-0 text-muted-foreground/60" />
                          <span className="truncate">{asset.location}</span>
                        </span>
                      </td>

                      {/* Assigned Holder */}
                      <td className="p-3.5">
                        {asset.holderName ? (
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <User className="size-3 text-teal-600" />
                            <span>{asset.holderName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ({asset.holderEmployeeId || "EMP"})
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <StatusBadge status={asset.status} />
                      </td>

                      {/* Clean & Muted Action Buttons Capsule */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5 shadow-sm">
                          
                          {/* 1. View */}
                          <button
                            type="button"
                            title="View Asset Details"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsAddOpen(true);
                            }}
                            className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-sky-600 hover:bg-sky-500/10 dark:hover:text-sky-400 dark:hover:bg-sky-500/15 transition-colors"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          
                          {/* 2. Edit */}
                          <button
                            type="button"
                            title="Edit Asset"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsAddOpen(true);
                            }}
                            className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-teal-600 hover:bg-teal-500/10 dark:hover:text-teal-400 dark:hover:bg-teal-500/15 transition-colors"
                          >
                            <Pencil className="size-3.5" />
                          </button>

                          {/* 3. Send to Maintenance */}
                          <button
                            type="button"
                            title={asset.status === "Under Maintenance" ? "Already in Maintenance" : "Send to Maintenance"}
                            disabled={asset.status === "Under Maintenance" || asset.status === "Scrapped"}
                            onClick={() => handleSendToMaintenance(asset)}
                            className={`size-7 rounded-md flex items-center justify-center transition-colors ${
                              asset.status === "Under Maintenance" || asset.status === "Scrapped"
                                ? "text-muted-foreground/20 cursor-not-allowed"
                                : "text-muted-foreground/70 hover:text-amber-600 hover:bg-amber-500/10 dark:hover:text-amber-400 dark:hover:bg-amber-500/15"
                            }`}
                          >
                            <Wrench className="size-3.5" />
                          </button>

                          {/* 4. Scrap Asset */}
                          <button
                            type="button"
                            title={asset.status === "Scrapped" ? "Already Scrapped" : "Scrap Asset (Decommission)"}
                            disabled={asset.status === "Scrapped"}
                            onClick={() => handleOpenScrapDialog(asset)}
                            className={`size-7 rounded-md flex items-center justify-center transition-colors ${
                              asset.status === "Scrapped"
                                ? "text-muted-foreground/20 cursor-not-allowed"
                                : "text-muted-foreground/70 hover:text-purple-600 hover:bg-purple-500/10 dark:hover:text-purple-400 dark:hover:bg-purple-500/15"
                            }`}
                          >
                            <Ban className="size-3.5" />
                          </button>

                          {/* 5. Delete Permanently */}
                          <button
                            type="button"
                            title="Delete Asset"
                            onClick={() => handleDelete(asset)}
                            className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>

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

      {/* Add / Edit Dialog */}
      <AddAssetDialog
        open={isAddOpen}
        asset={selectedAsset}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setSelectedAsset(null);
        }}
        onSubmit={handleSaveAsset}
      />

      {/* Scrap Modal */}
      <Dialog open={isScrapOpen} onOpenChange={setIsScrapOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5" /> Scrap Asset Confirmation
            </DialogTitle>
            <DialogDescription className="text-xs">
              Decommissioning <strong className="text-foreground">{scrapTargetAsset?.name}</strong> ({scrapTargetAsset?.serialNumber}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-foreground">
              Scrap Reason &amp; Disposal Details *
            </label>
            <Textarea
              rows={3}
              placeholder="e.g. Unrepairable motherboard failure, obsolete hardware, liquid damage..."
              value={scrapReason}
              onChange={(e) => setScrapReason(e.target.value)}
              className="text-xs"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              This note will be permanently logged under the asset's history and its status will be updated to <strong>Scrapped</strong>.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsScrapOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleConfirmScrap}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              Confirm Scrap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}