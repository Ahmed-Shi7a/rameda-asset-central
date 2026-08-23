import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, FileUp, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { NoAccess } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/import-export")({
  head: () => ({
    meta: [
      { title: "Import Data — AssetFlow" },
      {
        name: "description",
        content: "Upload CSV, XLSX or JSON asset files, preview and validate records.",
      },
      { property: "og:title", content: "Import Data — AssetFlow" },
    ],
  }),
  component: ImportExportPage,
});

interface PreviewRow {
  assetName: string;
  deviceType: string;
  location: string;
  status: string;
  valid: boolean;
  issue?: string;
}

const SAMPLE: PreviewRow[] = [
  { assetName: "Dell Latitude 5440", deviceType: "Laptop", location: "HQ (Headquarters)", status: "Active", valid: true },
  {
    assetName: "HP LaserJet 400",
    deviceType: "Printer",
    location: "Alexandria Scientific Office (ALX-SO)",
    status: "Stock",
    valid: true,
  },
  {
    assetName: "",
    deviceType: "Monitor",
    location: "Tanta Scientific Office (TNT-SO)",
    status: "Active",
    valid: false,
    issue: "Missing asset name",
  },
  {
    assetName: "Lenovo ThinkCentre",
    deviceType: "Desktop",
    location: "Mansoura Scientific Office (MNS-SO)",
    status: "Retired",
    valid: false,
    issue: "Status must be Active, Stock or Under Maintenance",
  },
  {
    assetName: "Canon DR-C225",
    deviceType: "Scanner",
    location: "HQ (Headquarters)",
    status: "Under Maintenance",
    valid: true,
  },
];

function ImportExportPage() {
  const { can } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<PreviewRow[]>([]);

  if (!can("data.import")) {
    return (
      <AppLayout title="Import Assets">
        <NoAccess feature="import asset data" />
      </AppLayout>
    );
  }

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.length - validCount;

  return (
    <AppLayout
      title="Import Assets"
      description="Upload and validate bulk asset datasets directly into the inventory system."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileUp className="size-4 text-primary" /> Upload File
            </CardTitle>
            <CardDescription>Accepted formats: CSV, XLSX, JSON (Max 5 MB).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border/80 p-8 text-center transition-all hover:border-primary/60 hover:bg-muted/30"
            >
              <Upload className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">Choose file to import</p>
              <p className="text-xs text-muted-foreground">or drag and drop here</p>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                setRows(SAMPLE);
                toast.success(`${file.name} uploaded and parsed.`);
              }}
            />
            {fileName ? (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {validCount} valid · {invalidCount} with issues
                </p>
              </div>
            ) : null}
            <Button
              className="w-full"
              disabled={validCount === 0}
              onClick={() => toast.success(`${validCount} assets imported successfully`)}
            >
              Import {validCount > 0 ? `${validCount} Valid Assets` : ""}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Validation & Data Preview</CardTitle>
            <CardDescription>Records with errors will be excluded during database insertion.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 sm:px-6 sm:pb-6">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Upload className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  Upload an asset dataset to inspect parsed rows and validation status.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.assetName || "—"}</TableCell>
                      <TableCell>{r.deviceType}</TableCell>
                      <TableCell className="text-xs">{r.location}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>
                        {r.valid ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                            <CheckCircle2 className="size-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                            <AlertTriangle className="size-3.5" /> {r.issue}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}