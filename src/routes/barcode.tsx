import { createFileRoute } from "@tanstack/react-router";
import { Camera, Printer, ScanLine, Search, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Barcode } from "@/components/Barcode";
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
import { useApp } from "@/lib/app-context";
import type { Asset } from "@/lib/types";

export const Route = createFileRoute("/barcode")({
  component: BarcodePage,
});

export function formatRamedaBarcode(asset: Asset, index: number = 1): string {
  const typeMap: Record<string, string> = {
    Laptop: "LAP",
    Desktop: "DES",
    Tablet: "TAB",
    Printer: "PRN",
    Scanner: "SCN",
    "Network Device": "NET",
    Server: "SRV",
    Monitor: "MON",
    Other: "OTH",
  };

  const devCode = typeMap[asset.deviceType] || "OTH";
  const numPart = asset.id ? asset.id.replace(/\D/g, "") : "";
  const finalNum = (numPart ? parseInt(numPart, 10) : 1000 + index).toString().padStart(6, "0");

  return `RMD-${devCode}-${finalNum}`;
}

type FormattedAsset = Asset & { ramedaBarcode: string };

function BarcodePage() {
  const { assets, can } = useApp();
  const [query, setQuery] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanned, setScanned] = useState<FormattedAsset | null>(null);
  const [printingAsset, setPrintingAsset] = useState<FormattedAsset | null>(null);
  const [printAll, setPrintAll] = useState(false);

  const formattedAssets: FormattedAsset[] = useMemo(() => {
    return assets.map((a, idx) => ({
      ...a,
      ramedaBarcode: formatRamedaBarcode(a, idx + 1),
    }));
  }, [assets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return formattedAssets;
    return formattedAssets.filter((a) =>
      [a.id, a.ramedaBarcode].join(" ").toLowerCase().includes(q)
    );
  }, [formattedAssets, query]);

  if (!can("barcode.view")) {
    return (
      <AppLayout title="Barcode Center">
        <NoAccess feature="view barcodes" />
      </AppLayout>
    );
  }

  function lookup(code: string) {
    const clean = code.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const found = formattedAssets.find(
      (a) =>
        a.ramedaBarcode.toLowerCase().replace(/[^a-z0-9]/g, "") === clean ||
        a.barcode.toLowerCase().replace(/[^a-z0-9]/g, "") === clean ||
        a.id.toLowerCase().replace(/[^a-z0-9]/g, "") === clean,
    );
    if (found) {
      setScanned(found);
      toast.success(`Matched: ${found.id} (${found.ramedaBarcode})`);
    } else {
      toast.error("No asset matches that barcode.");
    }
  }

  function printSingle(asset: FormattedAsset) {
    setPrintAll(false);
    setPrintingAsset(asset);
    setTimeout(() => {
      window.print();
    }, 120);
  }

  function handlePrintAll() {
    setPrintAll(true);
    setPrintingAsset(null);
    setTimeout(() => {
      window.print();
    }, 120);
  }

  return (
    <AppLayout
      title="Barcode & Asset Labels"
      description="Standardized RAMEDA asset stickers (RMD-TYPE-000000) optimized for thermal and sheet printing."
      actions={
        <div className="flex items-center gap-2">
          {can("barcode.print") && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shadow-sm text-xs"
              onClick={handlePrintAll}
              disabled={filtered.length === 0}
            >
              <Printer className="size-3.5" /> Print Sheet ({filtered.length})
            </Button>
          )}
          {can("barcode.scan") && (
            <Button size="sm" onClick={() => setScannerOpen(true)} className="gap-1.5 shadow-sm text-xs">
              <ScanLine className="size-3.5" /> Scan Label
            </Button>
          )}
        </div>
      }
    >
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 2mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-label-container {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 50mm !important;
            height: 30mm !important;
            margin: 0 auto !important;
            padding: 2mm !important;
            border: 1px dashed #777 !important;
            border-radius: 4px !important;
            page-break-inside: avoid !important;
          }
          .print-sheet-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 3mm !important;
          }
        }
      `}</style>

      {!printAll && printingAsset && (
        <div className="print-area hidden print:block">
          <div className="print-label-container text-center">
            <div className="w-full flex items-center justify-between border-b border-black/40 pb-0.5 mb-1 px-1">
              <span className="text-[8.5px] font-black tracking-wider uppercase text-black">RAMEDA</span>
              <span className="font-mono text-[8.5px] font-bold text-black">{printingAsset.id}</span>
            </div>
            
            <div className="my-1 flex justify-center scale-95">
              <Barcode value={printingAsset.ramedaBarcode.replace(/-/g, "")} height={36} />
            </div>

            <p className="font-mono text-[11px] font-black tracking-widest text-black mt-0.5">
              {printingAsset.ramedaBarcode}
            </p>
          </div>
        </div>
      )}

      {printAll && (
        <div className="print-area hidden print:block">
          <div className="print-sheet-grid">
            {filtered.map((a) => (
              <div key={a.id} className="print-label-container text-center">
                <div className="w-full flex items-center justify-between border-b border-black/30 pb-0.5 mb-0.5 px-0.5">
                  <span className="text-[7.5px] font-black uppercase text-black">RAMEDA</span>
                  <span className="font-mono text-[7.5px] font-bold text-black">{a.id}</span>
                </div>
                <div className="my-0.5 flex justify-center scale-80">
                  <Barcode value={a.ramedaBarcode.replace(/-/g, "")} height={30} />
                </div>
                <p className="font-mono text-[9.5px] font-black tracking-wider text-black">
                  {a.ramedaBarcode}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="no-print mb-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 h-9 text-xs"
            placeholder="Search by Asset ID or RMD code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto justify-between sm:justify-end">
          <Badge variant="secondary" className="font-mono text-[11px] px-2.5 py-0.5">
            Format: RMD-TYPE-000000
          </Badge>
          <span>{filtered.length} stickers</span>
        </div>
      </div>

      <div className="no-print grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((a) => (
          <Card
            key={a.id}
            className="group relative overflow-hidden border-border/70 shadow-sm transition-all hover:border-primary/50 hover:shadow-md bg-card"
          >
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-3.5 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                RAMEDA
              </span>
              <span className="font-mono text-[10px] font-semibold text-primary">{a.id}</span>
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col items-center justify-center rounded-lg bg-white p-3 shadow-inner border border-border/40">
                <Barcode value={a.ramedaBarcode.replace(/-/g, "")} height={50} />
                <span className="mt-2 font-mono text-xs font-black tracking-widest text-neutral-900">
                  {a.ramedaBarcode}
                </span>
              </div>

              {can("barcode.print") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 gap-1.5 text-xs group-hover:border-primary/50 group-hover:bg-primary/5"
                  onClick={() => printSingle(a)}
                >
                  <Printer className="size-3.5" /> Print Sticker
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Tag className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            No barcode labels found matching your search.
          </div>
        )}
      </div>

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="size-5 text-primary" /> Barcode Scanner & Lookup
            </DialogTitle>
            <DialogDescription>
              Scan with camera or enter the RAMEDA barcode / Asset ID.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-950 flex flex-col items-center justify-center border border-border">
              <div className="absolute inset-5 rounded-lg border-2 border-dashed border-primary/60" />
              <div className="absolute inset-x-5 top-1/2 h-0.5 animate-pulse bg-primary" />
              <Camera className="size-8 text-slate-500 mb-1" />
              <p className="text-[11px] text-slate-400 font-medium">Ready for camera feed / scanner</p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="e.g. RMD-LAP-001001 or AST-1001"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup(manualCode)}
                className="text-xs"
              />
              <Button size="sm" onClick={() => lookup(manualCode)}>
                Look up
              </Button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                const random = formattedAssets[Math.floor(Math.random() * formattedAssets.length)];
                if (random) lookup(random.ramedaBarcode);
              }}
            >
              Simulate Scan (Random Asset)
            </Button>

            {scanned && (
              <div className="rounded-xl border border-primary/40 bg-primary/5 p-3.5 space-y-2.5 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{scanned.id}</span>
                  <StatusBadge status={scanned.status} />
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {scanned.ramedaBarcode}
                  </p>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={() => printSingle(scanned)}
                  >
                    <Printer className="size-3.5" /> Print This Sticker
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}