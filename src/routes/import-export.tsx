import { createFileRoute } from "@tanstack/react-router";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  Package, 
  History, 
  Layers, 
  Trash2, 
  FileCheck 
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useApp } from "@/lib/app-context";
import { type Asset, type AssetStatus } from "@/lib/types";

export const Route = createFileRoute("/import-export")({
  component: ImportAssetsPage,
});

type ImportMode = "active" | "stock-new" | "stock-used" | "mixed";

interface ImportOption {
  id: ImportMode;
  title: string;
  desc: string;
  badge: string;
  icon: any;
  defaultStatus?: AssetStatus;
}

const IMPORT_OPTIONS: ImportOption[] = [
  {
    id: "active",
    title: "Active Assets",
    desc: "Import currently assigned assets. Requires employee details.",
    badge: "Active",
    icon: CheckCircle2,
    defaultStatus: "Active",
  },
  {
    id: "stock-new",
    title: "Stock — New",
    desc: "Import brand new boxed items. Excludes employee assignments.",
    badge: "Stock - New",
    icon: Package,
    defaultStatus: "Stock - New",
  },
  {
    id: "stock-used",
    title: "Stock — Used",
    desc: "Import returned/used stock items ready for re-assignment.",
    badge: "Stock - Used",
    icon: History,
    defaultStatus: "Stock - Used",
  },
  {
    id: "mixed",
    title: "All Statuses (Mixed)",
    desc: "Auto-detect status for each row directly from the file column.",
    badge: "Smart Detection",
    icon: Layers,
  },
];

export function ImportAssetsPage() {
  const { addAsset } = useApp() as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMode, setSelectedMode] = useState<ImportMode>("stock-new");
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Partial<Asset>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Read file locally for PREVIEW only
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = (evt.target?.result as string) || "";
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);

        if (!lines || lines.length <= 1) {
          toast.error("File is empty or missing data rows.");
          setIsProcessing(false);
          return;
        }

        const firstLine = lines[0] || "";
        const headers = firstLine.split(",").map((h) => h.trim().toLowerCase());
        const data: Partial<Asset>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i] || "";
          const cols = currentLine.split(",").map((c) => c.trim());
          if (cols.length < 2) continue;

          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = cols[idx] ?? "";
          });

          let finalStatus: AssetStatus = "Stock - New";
          if (selectedMode === "active") finalStatus = "Active";
          else if (selectedMode === "stock-new") finalStatus = "Stock - New";
          else if (selectedMode === "stock-used") finalStatus = "Stock - Used";
          else {
            const rawStatus = (row["status"] || "").toLowerCase();
            if (rawStatus.includes("new")) finalStatus = "Stock - New";
            else if (rawStatus.includes("used")) finalStatus = "Stock - Used";
            else if (rawStatus.includes("maint")) finalStatus = "Under Maintenance";
            else if (rawStatus.includes("scrap")) finalStatus = "Scrapped";
            else finalStatus = "Active";
          }

          data.push({
            name: row["asset name"] || row["name"] || row["type"] || "Laptop Unit",
            deviceType: row["device type"] || row["type"] || "Laptop",
            brand: row["brand"] || "Dell",
            model: row["model"] || "Standard",
            serialNumber: row["serial number"] || row["serial"] || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
            status: finalStatus,
            location: row["location"] || "HQ (Headquarters)",
            holderName: finalStatus === "Stock - New" ? "" : (row["employee name"] || row["holder"] || ""),
            holderEmployeeId: finalStatus === "Stock - New" ? "" : (row["employee id"] || row["empid"] || ""),
            supplier: row["supplier"] || "Company Vendor",
            deliveryDate: row["delivery date"] || new Date().toISOString().split("T")[0],
            manufacturingDate: row["manufacturing date"] || "2025-01-01",
          });
        }

        setParsedRows(data);
        toast.success(`Successfully parsed ${data.length} assets for preview.`);
      } catch (err) {
        toast.error("Failed to parse file format. Please use a valid CSV.");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(selectedFile);
  };

  async function handleBulkImport() {
    if (!file && parsedRows.length === 0) {
      toast.error("No valid asset records to import.");
      return;
    }

    setIsProcessing(true);

    /* ========================================================================= */
    /* 🚨🚨🚨 BACKEND TEAM: UNCOMMENT THIS BLOCK FOR REAL API INTEGRATION 🚨🚨🚨 */
    /* ========================================================================= */
    /*
    try {
      if (!file) throw new Error("No file selected.");

      const formData = new FormData();
      formData.append("file", file); // Send the actual Excel/CSV file
      formData.append("importMode", selectedMode); // Let backend know the selected mode

      // TODO: REPLACE URL WITH REAL DJANGO BULK IMPORT ENDPOINT
      const response = await fetch("https://api.yourdomain.com/api/assets/bulk-import", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
          // NOTE: Do NOT set "Content-Type" manually when sending FormData, the browser sets it with the correct boundary automatically.
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to import file.");
      }

      const result = await response.json();
      toast.success(`Successfully imported ${result.importedCount || parsedRows.length} assets!`);
      
      // Reset Form
      setFile(null);
      setParsedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast.error(error.message || "Import failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
    return; // 🛑 IMPORTANT: RETURN HERE TO PREVENT RUNNING THE MOCK CODE BELOW 🛑
    */
    /* ========================================================================= */


    /* ========================================================================= */
    /* 🟢🟢🟢 FRONTEND MOCK MODE (REMOVE WHEN BACKEND IS READY) 🟢🟢🟢 */
    /* ========================================================================= */
    let count = 0;
    parsedRows.forEach((assetData) => {
      if (typeof addAsset === "function") {
        addAsset(assetData);
        count++;
      }
    });

    setTimeout(() => {
      toast.success(`Successfully imported ${count || parsedRows.length} assets into inventory! (Mock Mode)`);
      setFile(null);
      setParsedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsProcessing(false);
    }, 800);
  }

  return (
    <AppLayout title="Import Assets" description="Upload and validate bulk asset datasets directly into the inventory system.">
      
      {/* 1. Category Modes */}
      <div className="mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
          1. Select Import Target Category
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {IMPORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedMode(opt.id);
                  if (parsedRows.length > 0 && opt.defaultStatus) {
                    setParsedRows((prev) =>
                      prev.map((r) => ({
                        ...r,
                        status: opt.defaultStatus,
                        holderName: opt.id === "stock-new" ? "" : (r.holderName || ""),
                        holderEmployeeId: opt.id === "stock-new" ? "" : (r.holderEmployeeId || ""),
                      }))
                    );
                  }
                }}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all relative ${
                  isSelected
                    ? "border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-sm ring-2 ring-teal-500/20"
                    : "border-border/80 bg-card hover:border-teal-500/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-teal-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="size-4.5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? "bg-teal-500/20 text-teal-700 dark:text-teal-300" : "bg-muted text-muted-foreground"
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground">{opt.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Upload and Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5 border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UploadCloud className="size-5 text-teal-600" /> Upload File
            </CardTitle>
            <CardDescription className="text-xs">
              Accepted formats: CSV, XLSX, XLS. Mode: <strong className="text-foreground">{IMPORT_OPTIONS.find(o => o.id === selectedMode)?.title}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-teal-500/60 rounded-2xl p-8 text-center cursor-pointer bg-muted/20 hover:bg-teal-50/20 dark:hover:bg-teal-950/10 transition-all flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="p-3.5 rounded-full bg-teal-500/10 text-teal-600 mb-3">
                <FileSpreadsheet className="size-8" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {file ? file.name : "Choose file to import"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Click to browse from your computer"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleBulkImport}
                disabled={parsedRows.length === 0 || isProcessing}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-2 shadow-sm"
              >
                <FileCheck className="size-4" /> Import {parsedRows.length > 0 ? `(${parsedRows.length}) Assets` : ""}
              </Button>
              {parsedRows.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => { setParsedRows([]); setFile(null); }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 border-border/80 shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Validation &amp; Data Preview</CardTitle>
                <CardDescription className="text-xs">
                  {parsedRows.length > 0
                    ? `Showing parsed preview for ${parsedRows.length} assets.`
                    : "Upload an asset dataset to inspect parsed rows and status mapping."}
                </CardDescription>
              </div>
              {parsedRows.length > 0 && (
                <span className="text-xs font-bold bg-teal-500/10 text-teal-600 px-2.5 py-1 rounded-md">
                  Ready to Insert
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-x-auto min-h-[260px]">
            {parsedRows.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <UploadCloud className="size-10 mb-2 opacity-30" />
                <p className="text-sm font-medium">No dataset loaded yet</p>
                <p className="text-xs mt-1">Select a category and choose a spreadsheet file.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Serial No</th>
                    <th className="p-3">Target Status</th>
                    <th className="p-3">Assigned To</th>
                    <th className="p-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {parsedRows.slice(0, 8).map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{row.name}</td>
                      <td className="p-3 font-mono text-[11px] text-muted-foreground">{row.serialNumber}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === "Active"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : row.status === "Stock - New"
                            ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {row.holderName ? `${row.holderName} (${row.holderEmployeeId || "N/A"})` : "—"}
                      </td>
                      <td className="p-3 text-muted-foreground truncate max-w-[120px]">{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}