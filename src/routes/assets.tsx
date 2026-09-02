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
  AlertTriangle,
  CalendarDays,
  ShieldCheck,
  Cpu,
  Info,
  FileText,
  Monitor,
  Tablet,
  Printer,
  PackageCheck,
  Loader2
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

const getDeviceIcon = (type?: string) => {
  switch (type) {
    case "Desktop":
    case "Monitor":
      return Monitor;
    case "Tablet":
      return Tablet;
    case "Printer":
      return Printer;
    case "Other":
      return PackageCheck;
    case "Laptop":
    default:
      return Laptop;
  }
};

function getWarrantyStatus(deliveryDate?: string, warrantyString?: string) {
  if (!deliveryDate || !warrantyString || warrantyString === "No Warranty") {
    return { label: "No Warranty", style: "bg-slate-100 text-slate-500 border-slate-200" };
  }

  const yearsMatch = warrantyString.match(/(\d+)/);
  const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
  
  if (years === 0) return { label: "No Warranty", style: "bg-slate-100 text-slate-500 border-slate-200" };

  const start = new Date(deliveryDate);
  start.setHours(0, 0, 0, 0);
  
  const expiryDate = new Date(start);
  expiryDate.setFullYear(expiryDate.getFullYear() + years);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { 
      label: `Expired ${Math.abs(diffDays)} Days ago`, 
      style: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm" 
    };
  }
  
  return { 
    label: `Expires in ${diffDays} Days`, 
    style: diffDays <= 30 ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm" : "bg-teal-50 text-teal-700 border-teal-200 shadow-sm" 
  };
}

const DetailItem = ({ label, value, mono = false }: { label: string, value: React.ReactNode, mono?: boolean }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    <span className={`text-sm font-medium text-foreground ${mono ? 'font-mono tracking-wide' : ''}`}>
      {value || "-"}
    </span>
  </div>
);

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
    addMaintenance,
    can // 🔐 جلب دالة الصلاحيات من الـ Context
  } = appContext;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  const [isScrapOpen, setIsScrapOpen] = useState(false);
  const [scrapTargetAsset, setScrapTargetAsset] = useState<Asset | null>(null);
  const [scrapReason, setScrapReason] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);

  // =========================================================================
  // 1. UPDATE ASSET FUNCTION (API + MOCK FALLBACK)
  // =========================================================================
  const updateSingleAsset = async (id: string, updatedFields: Partial<Asset>) => {
    const target = assets.find((a: Asset) => a.id === id) || {};
    const mergedAsset = { ...target, ...updatedFields, id };

    /* 🚨🚨🚨 BACKEND TEAM: UNCOMMENT FOR REAL API 🚨🚨🚨 */
    /*
    try {
      const response = await fetch(`https://api.yourdomain.com/api/assets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(mergedAsset),
      });
      if (!response.ok) throw new Error("Failed to update asset.");
      
      const updated = await response.json();
      if (typeof updateAsset === "function") updateAsset(updated);
      return;
    } catch (error) {
      console.error("API update failed, using local state fallback");
    }
    */

    // 🟢 MOCK FALLBACK 🟢
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

  // =========================================================================
  // 2. SEND TO MAINTENANCE FUNCTION (API + MOCK FALLBACK)
  // =========================================================================
  const handleSendToMaintenance = async (asset: Asset) => {
    if (typeof can === "function" && !can("assets.edit")) {
      toast.error("You do not have permission to modify or send assets to maintenance.");
      return;
    }

    setIsProcessing(true);
    updateSingleAsset(asset.id, { status: "Under Maintenance" });
    
    const maintenanceData = {
      id: `MNT-${Date.now().toString().slice(-4)}`,
      assetId: asset.id,
      assetName: asset.name || `${asset.brand || ""} ${asset.model || ""}`.trim(),
      issue: "Routine checkup & repair from Assets Inventory",
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };

    /* 🚨🚨🚨 BACKEND TEAM: UNCOMMENT FOR REAL API 🚨🚨🚨 */
    /*
    try {
      await fetch("https://api.yourdomain.com/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(maintenanceData),
      });
    } catch (e) {
      console.error("API maintenance log failed");
    }
    */

    // 🟢 MOCK FALLBACK 🟢
    if (typeof addMaintenanceRecord === "function") addMaintenanceRecord(maintenanceData);
    else if (typeof addMaintenanceJob === "function") addMaintenanceJob(maintenanceData);
    else if (typeof addMaintenance === "function") addMaintenance(maintenanceData);

    setIsProcessing(false);
    toast.success(`${asset.name} moved to Maintenance.`);
  };

  const handleOpenScrapDialog = (asset: Asset) => {
    if (typeof can === "function" && !can("assets.edit")) {
      toast.error("You do not have permission to scrap or decommission assets.");
      return;
    }
    setScrapTargetAsset(asset);
    setScrapReason("");
    setIsScrapOpen(true);
  };

  // =========================================================================
  // 3. SCRAP / DECOMMISSION ASSET FUNCTION
  // =========================================================================
  const handleConfirmScrap = async () => {
    if (!scrapTargetAsset) return;
    if (!scrapReason.trim()) {
      toast.error("Please enter a reason for scrapping this asset.");
      return;
    }

    setIsProcessing(true);
    const updatedNotes = scrapTargetAsset.notes 
      ? `${scrapTargetAsset.notes} | [Scrapped]: ${scrapReason.trim()}` 
      : `[Scrapped]: ${scrapReason.trim()}`;

    await updateSingleAsset(scrapTargetAsset.id, {
      status: "Scrapped",
      notes: updatedNotes,
    });

    setIsProcessing(false);
    toast.success(`${scrapTargetAsset.name} marked as Scrapped.`);
    setIsScrapOpen(false);
    setScrapTargetAsset(null);
    setScrapReason("");
  };

  // =========================================================================
  // 4. DELETE ASSET FUNCTION (API + MOCK FALLBACK)
  // =========================================================================
  const handleDelete = async (asset: Asset) => {
    if (typeof can === "function" && !can("assets.delete")) {
      toast.error("Access Denied: You do not have permission to delete assets.");
      return;
    }

    if (confirm(`Are you sure you want to delete ${asset.name} (${asset.serialNumber}) permanently?`)) {
      /* 🚨🚨🚨 BACKEND TEAM: UNCOMMENT FOR REAL API 🚨🚨🚨 */
      /*
      try {
        await fetch(`https://api.yourdomain.com/api/assets/${asset.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
      } catch (e) {
        console.error("API delete failed");
      }
      */

      // 🟢 MOCK FALLBACK 🟢
      if (typeof deleteAsset === "function") {
        deleteAsset(asset.id);
        toast.success("Asset deleted permanently.");
      }
    }
  };

  const handleSaveAsset = (payload: Omit<Asset, "id" | "barcode">) => {
    if (selectedAsset) {
      if (typeof can === "function" && !can("assets.edit")) {
        toast.error("You do not have permission to edit assets.");
        return;
      }
      updateSingleAsset(selectedAsset.id, payload);
      toast.success("Asset updated successfully.");
    } else {
      if (typeof can === "function" && !can("assets.add")) {
        toast.error("You do not have permission to add new assets.");
        return;
      }
      if (typeof addAsset === "function") {
        addAsset(payload);
        toast.success("Asset added to inventory.");
      }
    }
    setIsAddOpen(false);
    setSelectedAsset(null);
  };

  const warrantyBadge = selectedAsset ? getWarrantyStatus(selectedAsset.deliveryDate, selectedAsset.warranty) : null;
  const DeviceIcon = getDeviceIcon(selectedAsset?.deviceType);
  const showEmployeeFields = selectedAsset?.holderName && selectedAsset?.status !== "Stock - New";

  // التحقق من صلاحيات العرض العامة للأزرار
  const canAdd = typeof can !== "function" || can("assets.add");
  const canEdit = typeof can !== "function" || can("assets.edit");
  const canDelete = typeof can !== "function" || can("assets.delete");

  return (
    <AppLayout
      title="Assets Inventory"
      description="Manage and track enterprise assets across HQ and regional scientific offices."
      actions={
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border/60">
            {filteredAssets.length} / {assets.length} Total Devices
          </span>
          {/* 🔐 زر إضافة جهاز يظهر فقط لو مسموح */}
          {canAdd && (
            <Button
              onClick={() => {
                setSelectedAsset(null);
                setIsAddOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium gap-1.5 shadow-sm shadow-teal-600/20"
            >
              <Plus className="size-4" /> Add Asset
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filters Bar */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
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
                  filteredAssets.map((asset: Asset) => {
                    const RowIcon = getDeviceIcon(asset.deviceType);
                    const isUnassigned = asset.status === "Stock - New" || !asset.holderName;
                    
                    return (
                      <tr key={asset.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="p-3.5 font-bold font-mono text-teal-600 dark:text-teal-400">
                          {asset.id || "AST-1000"}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-foreground">{asset.name}</div>
                          <div className="text-[11px] text-muted-foreground font-normal">
                            {asset.brand} {asset.model} &bull; <span className="font-mono">{asset.serialNumber}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                            <RowIcon className="size-3.5 text-muted-foreground" />
                            {asset.deviceType || "Laptop"}
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground max-w-[180px] truncate" title={asset.location}>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 shrink-0 text-muted-foreground/60" />
                            <span className="truncate">{asset.location}</span>
                          </span>
                        </td>
                        <td className="p-3.5">
                          {!isUnassigned ? (
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
                        <td className="p-3.5">
                          <StatusBadge status={asset.status} />
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5 shadow-sm">
                            {/* زر العرض متاح دائماً للجميع */}
                            <button
                              type="button"
                              title="View Asset Details"
                              onClick={() => {
                                setSelectedAsset(asset);
                                setIsViewOpen(true);
                              }}
                              className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-sky-600 hover:bg-sky-500/10 transition-colors"
                            >
                              <Eye className="size-3.5" />
                            </button>
                            
                            {/* 🔐 زر التعديل مرتبط بصلاحية edit */}
                            {canEdit && (
                              <button
                                type="button"
                                title="Edit Asset"
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setIsAddOpen(true);
                                }}
                                className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-teal-600 hover:bg-teal-500/10 transition-colors"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                            )}

                            {/* 🔐 زر الصيانة مرتبط بصلاحية edit */}
                            {canEdit && (
                              <button
                                type="button"
                                title={asset.status === "Under Maintenance" ? "Already in Maintenance" : "Send to Maintenance"}
                                disabled={asset.status === "Under Maintenance" || asset.status === "Scrapped" || isProcessing}
                                onClick={() => handleSendToMaintenance(asset)}
                                className={`size-7 rounded-md flex items-center justify-center transition-colors ${
                                  asset.status === "Under Maintenance" || asset.status === "Scrapped"
                                    ? "text-muted-foreground/20 cursor-not-allowed"
                                    : "text-muted-foreground/70 hover:text-amber-600 hover:bg-amber-500/10"
                                }`}
                              >
                                <Wrench className="size-3.5" />
                              </button>
                            )}

                            {/* 🔐 زر الخردة مرتبط بصلاحية edit */}
                            {canEdit && (
                              <button
                                type="button"
                                title={asset.status === "Scrapped" ? "Already Scrapped" : "Scrap Asset (Decommission)"}
                                disabled={asset.status === "Scrapped" || isProcessing}
                                onClick={() => handleOpenScrapDialog(asset)}
                                className={`size-7 rounded-md flex items-center justify-center transition-colors ${
                                  asset.status === "Scrapped"
                                    ? "text-muted-foreground/20 cursor-not-allowed"
                                    : "text-muted-foreground/70 hover:text-purple-600 hover:bg-purple-500/10"
                                }`}
                              >
                                <Ban className="size-3.5" />
                              </button>
                            )}

                            {/* 🔐 زر الحذف مرتبط بصلاحية delete */}
                            {canDelete && (
                              <button
                                type="button"
                                title="Delete Asset"
                                disabled={isProcessing}
                                onClick={() => handleDelete(asset)}
                                className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 bg-background overflow-hidden shadow-2xl border-border/60">
          
          <div className="px-7 py-5 border-b bg-muted/10 flex items-start justify-between">
            <div className="space-y-1.5 pr-4">
              <DialogTitle className="text-[1.35rem] font-bold text-foreground flex items-center gap-2.5 leading-none">
                <DeviceIcon className="size-5 text-teal-600" />
                {selectedAsset?.name || selectedAsset?.deviceType || "Asset Details"}
              </DialogTitle>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="font-mono font-semibold text-teal-700 bg-teal-500/10 px-1.5 py-0.5 rounded">
                  {selectedAsset?.id}
                </span>
                <span>•</span>
                <span>{selectedAsset?.brand || "Generic"} {selectedAsset?.model || ""}</span>
              </div>
            </div>
            
            {warrantyBadge && (
              <div className="mr-6 shrink-0 mt-0.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border rounded-full ${warrantyBadge.style}`}>
                  <ShieldCheck className="size-3.5" />
                  {warrantyBadge.label}
                </span>
              </div>
            )}
          </div>

          <div className="px-7 py-6 overflow-y-auto max-h-[65vh] space-y-7">
            <section>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-4">
                <Info className="size-4 text-muted-foreground" /> Identity &amp; Specs
              </h4>
              <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                <DetailItem label="Serial Number" value={selectedAsset?.serialNumber} mono />
                <DetailItem label="Device Type" value={selectedAsset?.deviceType} />
              </div>
            </section>

            <div className="h-px w-full bg-border/60" />

            <section>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-4">
                <MapPin className="size-4 text-muted-foreground" /> Status &amp; Assignment
              </h4>
              <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                <div>
                  <span className="text-[13px] text-muted-foreground block mb-1.5">Current Status</span>
                  <div><StatusBadge status={selectedAsset?.status as any} /></div>
                </div>
                <DetailItem label="Location" value={selectedAsset?.location} />
                
                <div className="col-span-2">
                  <span className="text-[13px] text-muted-foreground block mb-2">Assigned Holder</span>
                  {showEmployeeFields ? (
                    <div className="flex items-center gap-2.5">
                      <div className="bg-teal-500/10 p-1.5 rounded-full">
                        <User className="size-4 text-teal-600" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{selectedAsset.holderName}</span>
                      <span className="text-xs font-mono text-muted-foreground">({selectedAsset.holderEmployeeId || "EMP"})</span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>
            </section>

            {selectedAsset?.deviceType && selectedAsset.deviceType !== "Other" && (
              <>
                <div className="h-px w-full bg-border/60" />
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-4">
                    <Cpu className="size-4 text-muted-foreground" /> {selectedAsset.deviceType} Specs
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-6">
                    {(selectedAsset.deviceType === "Laptop" || selectedAsset.deviceType === "Desktop") && (
                      <>
                        <DetailItem label="Processor (CPU)" value={selectedAsset.processor} />
                        <DetailItem label="RAM" value={selectedAsset.ram} />
                        <DetailItem label="Hard Disk Type" value={selectedAsset.hardDiskType} />
                        <DetailItem label="Storage Capacity" value={selectedAsset.memory || selectedAsset.storage} />
                        <DetailItem label="Graphic Card (GPU)" value={selectedAsset.gpu} />
                      </>
                    )}

                    {selectedAsset.deviceType === "Tablet" && (
                      <>
                        <DetailItem label="IMEI Number" value={selectedAsset.imei} mono />
                        <DetailItem label="Screen Size" value={selectedAsset.screenSize} />
                        <DetailItem label="RAM" value={selectedAsset.ram} />
                        <DetailItem label="Storage Capacity" value={selectedAsset.memory || selectedAsset.storage} />
                      </>
                    )}

                    {selectedAsset.deviceType === "Printer" && (
                      <>
                        <DetailItem label="Printer Type" value={selectedAsset.printerType} />
                        <DetailItem label="Print Color" value={selectedAsset.printOutput} />
                        <DetailItem label="Cartridge / Toner" value={selectedAsset.cartridgeModel} />
                      </>
                    )}

                    {selectedAsset.deviceType === "Monitor" && (
                      <>
                        <DetailItem label="Screen Size" value={selectedAsset.screenSize} />
                        <DetailItem label="Resolution" value={selectedAsset.resolution} />
                      </>
                    )}
                  </div>
                </section>
              </>
            )}

            <div className="h-px w-full bg-border/60" />

            <section>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-4">
                <CalendarDays className="size-4 text-muted-foreground" /> Procurement Details
              </h4>
              <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                <DetailItem label="Supplier" value={selectedAsset?.supplier} />
                <DetailItem label="Warranty Period" value={selectedAsset?.warranty} />
                <DetailItem label="Delivery Date" value={selectedAsset?.deliveryDate} />
              </div>
            </section>

            {selectedAsset?.notes && (
              <>
                <div className="h-px w-full bg-border/60" />
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-4">
                    <FileText className="size-4 text-muted-foreground" /> Notes &amp; Description
                  </h4>
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {selectedAsset.notes}
                  </div>
                </section>
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t bg-muted/10 flex justify-end shrink-0">
            <Button variant="outline" onClick={() => setIsViewOpen(false)} className="font-medium bg-background">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddAssetDialog
        open={isAddOpen}
        asset={selectedAsset}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setSelectedAsset(null);
        }}
        onSubmit={handleSaveAsset}
      />

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
            <Button variant="secondary" size="sm" onClick={() => setIsScrapOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              disabled={isProcessing}
              onClick={handleConfirmScrap}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              {isProcessing ? <Loader2 className="size-4 animate-spin" /> : "Confirm Scrap"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}