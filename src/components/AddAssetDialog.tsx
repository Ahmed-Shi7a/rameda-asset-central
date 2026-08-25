import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  Laptop,
  Monitor,
  Printer,
  Tablet,
  PackageCheck,
  ChevronLeft,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ASSET_STATUSES, LOCATIONS, type Asset, type AssetStatus } from "@/lib/types";

// بطاقات الأجهزة المعتمدة مع هوية بصرية مخصصة لكل نوع
export const APP_DEVICE_TYPES = [
  { 
    id: "Laptop", 
    label: "Laptop", 
    icon: Laptop, 
    desc: "Notebooks & Ultrabooks",
    iconTheme: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    badge: "Portable",
  },
  { 
    id: "Desktop", 
    label: "Desktop", 
    icon: Monitor, 
    desc: "PC Towers & All-in-Ones",
    iconTheme: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    badge: "Workstation",
  },
  { 
    id: "Tablet", 
    label: "Tablet", 
    icon: Tablet, 
    desc: "iPads & Android Tablets",
    iconTheme: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    badge: "Mobile",
  },
  { 
    id: "Printer", 
    label: "Printer", 
    icon: Printer, 
    desc: "Laser, Inkjet & Multi",
    iconTheme: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    badge: "Peripheral",
  },
  { 
    id: "Monitor", 
    label: "Monitor", 
    icon: Monitor, 
    desc: "Screens & Displays",
    iconTheme: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    badge: "Display",
  },
  { 
    id: "Other", 
    label: "Other", 
    icon: PackageCheck, 
    desc: "Accessories & Peripherals",
    iconTheme: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    badge: "General",
  },
] as const;

const WARRANTY_PERIODS = ["1 Year", "2 Years", "3 Years", "5 Years", "No Warranty"] as const;

interface AddAssetDialogProps {
  open: boolean;
  asset: Asset | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: Omit<Asset, "id" | "barcode">) => void;
}

export function AddAssetDialog({ open, asset, onOpenChange, onSubmit }: AddAssetDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<string>("Laptop");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState<AssetStatus>("Stock - New");
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  
  const [holderName, setHolderName] = useState("");
  const [holderEmployeeId, setHolderEmployeeId] = useState("");
  
  const [supplier, setSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [warranty, setWarranty] = useState("1 Year");

  // Specs States
  const [processor, setProcessor] = useState("");
  const [ram, setRam] = useState("");
  const [hardDiskType, setHardDiskType] = useState("SSD");
  const [memory, setMemory] = useState("");
  const [gpu, setGpu] = useState("");
  const [imei, setImei] = useState("");
  const [screenSize, setScreenSize] = useState("");
  const [printerType, setPrinterType] = useState("Laser");
  const [printOutput, setPrintOutput] = useState("Monochrome");
  const [cartridgeModel, setCartridgeModel] = useState("");
  const [resolution, setResolution] = useState("1080p");
  const [notes, setNotes] = useState("");

  const showEmployeeFields = status !== "Stock - New";

  const resetForm = () => {
    setStep(1);
    setSelectedType("Laptop");
    setName("Laptop");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setStatus("Stock - New");
    setLocation(LOCATIONS[0]);
    setHolderName("");
    setHolderEmployeeId("");
    setSupplier("");
    setDeliveryDate("");
    setManufacturingDate("");
    setWarranty("1 Year");
    setProcessor("");
    setRam("");
    setHardDiskType("SSD");
    setMemory("");
    setGpu("");
    setImei("");
    setScreenSize("");
    setPrinterType("Laser");
    setPrintOutput("Monochrome");
    setCartridgeModel("");
    setResolution("1080p");
    setNotes("");
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    if (asset) {
      setStep(2);
      setSelectedType(asset.deviceType || "Laptop");
      setName(asset.name || "");
      setBrand(asset.brand || "");
      setModel(asset.model || "");
      setSerialNumber(asset.serialNumber || "");
      setStatus(asset.status || "Stock - New");
      setLocation(asset.location || LOCATIONS[0]);
      setHolderName(asset.holderName || "");
      setHolderEmployeeId(asset.holderEmployeeId || "");
      setSupplier(asset.supplier || "");
      setDeliveryDate(asset.deliveryDate || "");
      setManufacturingDate(asset.manufacturingDate || "");
      setWarranty(asset.warranty || "1 Year");
      setProcessor(asset.processor || "");
      setRam(asset.ram || "");
      setHardDiskType(asset.hardDiskType || "SSD");
      setMemory(asset.memory || "");
      setGpu(asset.gpu || "");
      setImei(asset.imei || "");
      setScreenSize(asset.screenSize || "");
      setPrinterType(asset.printerType || "Laser");
      setPrintOutput(asset.printOutput || "Monochrome");
      setCartridgeModel(asset.cartridgeModel || "");
      setResolution(asset.resolution || "1080p");
      setNotes(asset.notes || "");
    }
  }, [open, asset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`File selected: ${file.name}`);
      e.target.value = '';
    }
  };

  const handleSubmit = () => {
    const reqFields = [
      { label: "Asset Name", val: name },
      { label: "Location", val: location },
      { label: "Supplier", val: supplier },
      { label: "Delivery Date", val: deliveryDate },
      { label: "Manufacturing Date", val: manufacturingDate },
    ];

    if (selectedType !== "Other") {
      reqFields.push({ label: "Serial Number", val: serialNumber });
      reqFields.push({ label: "Brand", val: brand });
      reqFields.push({ label: "Model", val: model });
    } else {
      reqFields.push({ label: "Item Description & Notes", val: notes });
    }

    if (showEmployeeFields) {
      reqFields.push({ label: "Assigned Employee Name", val: holderName });
      reqFields.push({ label: "Assigned Employee ID", val: holderEmployeeId });
    }

    if (selectedType === "Laptop" || selectedType === "Desktop") {
      reqFields.push(
        { label: "Processor", val: processor },
        { label: "RAM", val: ram },
        { label: "Storage Capacity", val: memory },
        { label: "Graphic Card (GPU)", val: gpu }
      );
    } else if (selectedType === "Tablet") {
      reqFields.push(
        { label: "IMEI Number", val: imei },
        { label: "Screen Size", val: screenSize },
        { label: "RAM", val: ram },
        { label: "Storage Capacity", val: memory }
      );
    } else if (selectedType === "Printer") {
      reqFields.push({ label: "Cartridge / Toner Model", val: cartridgeModel });
    } else if (selectedType === "Monitor") {
      reqFields.push({ label: "Screen Size", val: screenSize });
    }

    for (const field of reqFields) {
      if (!field.val || !String(field.val).trim()) {
        toast.error(`Please fill the required field: ${field.label}`);
        return; 
      }
    }

    const payload: Omit<Asset, "id" | "barcode"> = {
      name,
      deviceType: selectedType,
      brand,
      model,
      serialNumber: selectedType === "Other" ? serialNumber || "N/A" : serialNumber,
      status,
      location,
      holderName,
      holderEmployeeId,
      supplier,
      deliveryDate,
      manufacturingDate,
      warranty,
      processor,
      ram,
      hardDiskType,
      memory,
      gpu,
      imei,
      screenSize,
      printerType,
      printOutput,
      cartridgeModel,
      resolution,
      notes,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl border-border/80 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            {asset ? `Edit: ${asset.name}` : `Add New Asset (${selectedType})`}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === 1
              ? "Select the hardware category to configure the right technical specifications."
              : `Fill in the required information for this ${selectedType}.`}
          </DialogDescription>
        </DialogHeader>

        {/* الخطوة 1: بطاقات الأجهزة التفاعلية الملونة */}
        {step === 1 && (
          <div className="py-3">
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
              {APP_DEVICE_TYPES.map((d) => {
                const Icon = d.icon;
                const isSelected = selectedType === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedType(d.id);
                      setName(d.id);
                      setStep(2);
                    }}
                    className={`group relative flex flex-col items-start justify-between rounded-2xl border p-4.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? "border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-sm ring-2 ring-teal-500/25"
                        : "border-border/80 bg-card hover:border-teal-500/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`p-2.5 rounded-xl border transition-transform duration-200 group-hover:scale-110 ${d.iconTheme}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      {isSelected ? (
                        <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {d.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-sm font-bold text-foreground block group-hover:text-teal-600 transition-colors">
                        {d.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug block">
                        {d.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* الخطوة 2: نماذج إدخال البيانات المكتملة */}
        {step === 2 && (
          <div className="space-y-4 pt-1">
            
            {/* بطاقة الاستيراد السريع */}
            {!asset && (
              <div className="flex items-center justify-between rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-teal-700 dark:text-teal-400">Bulk Import via CSV / Excel</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Save time by importing multiple assets at once using our spreadsheet template.</p>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  onChange={handleFileUpload} 
                />
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-teal-500/50 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 font-medium"
                >
                  <UploadCloud className="size-4 mr-2" /> Import File
                </Button>
              </div>
            )}

            {selectedType === "Other" ? (
              <div className="space-y-3">
                <Field label="Item Name *">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wireless Ergonomic Mouse" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Brand / Manufacturer *">
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Logitech, Anker" />
                  </Field>
                  <Field label="Location *">
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Item Description & Notes *">
                  <Textarea
                    rows={4}
                    placeholder="Enter specs or details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Field>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    1. Basic Information
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Asset Name *">
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`e.g. ${brand || selectedType} Unit`} />
                    </Field>
                    <Field label="Serial Number *">
                      <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="e.g. SN-981240" />
                    </Field>
                    <Field label="Brand *">
                      <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Dell, HP, Apple" />
                    </Field>
                    <Field label="Model *">
                      <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Latitude 5420, M-102" />
                    </Field>
                    <Field label="Status *">
                      <Select value={status} onValueChange={(v) => setStatus(v as AssetStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ASSET_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Location *">
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>

                <div className="rounded-xl border border-teal-500/30 bg-teal-500/[0.02] p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    2. {selectedType} Hardware Specs
                  </h4>

                  {(selectedType === "Laptop" || selectedType === "Desktop") && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Processor (CPU) *">
                        <Input value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="e.g. Intel Core i7-12700H" />
                      </Field>
                      <Field label="RAM (GB) *">
                        <Input value={ram} onChange={(e) => setRam(e.target.value)} placeholder="e.g. 16 GB" />
                      </Field>
                      <Field label="Hard Disk Type *">
                        <Select value={hardDiskType} onValueChange={setHardDiskType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SSD">SSD</SelectItem>
                            <SelectItem value="HDD">HDD</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Storage Capacity *">
                        <Input value={memory} onChange={(e) => setMemory(e.target.value)} placeholder="e.g. 512 GB" />
                      </Field>
                      <Field label="Graphic Card (GPU) *">
                        <Input value={gpu} onChange={(e) => setGpu(e.target.value)} placeholder="e.g. RTX 3050 / Iris Xe" />
                      </Field>
                    </div>
                  )}

                  {selectedType === "Tablet" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="IMEI Number *">
                        <Input value={imei} onChange={(e) => setImei(e.target.value)} placeholder="e.g. 354890123456789" />
                      </Field>
                      <Field label="Screen Size (Inches) *">
                        <Input value={screenSize} onChange={(e) => setScreenSize(e.target.value)} placeholder="e.g. 10.9-inch" />
                      </Field>
                      <Field label="RAM *">
                        <Input value={ram} onChange={(e) => setRam(e.target.value)} placeholder="e.g. 8 GB" />
                      </Field>
                      <Field label="Storage Capacity *">
                        <Input value={memory} onChange={(e) => setMemory(e.target.value)} placeholder="e.g. 128 GB" />
                      </Field>
                    </div>
                  )}

                  {selectedType === "Printer" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Printer Type *">
                        <Select value={printerType} onValueChange={setPrinterType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Laser">Laser</SelectItem>
                            <SelectItem value="Inkjet">Inkjet</SelectItem>
                            <SelectItem value="Thermal">Thermal</SelectItem>
                            <SelectItem value="Multifunction">Multifunction (All-in-One)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Print Color *">
                        <Select value={printOutput} onValueChange={setPrintOutput}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monochrome">Monochrome (Black & White)</SelectItem>
                            <SelectItem value="Color">Color</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Cartridge / Toner Model *">
                        <Input value={cartridgeModel} onChange={(e) => setCartridgeModel(e.target.value)} placeholder="e.g. HP 26A / CF226A" />
                      </Field>
                    </div>
                  )}

                  {selectedType === "Monitor" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Screen Size (Inches) *">
                        <Input value={screenSize} onChange={(e) => setScreenSize(e.target.value)} placeholder="e.g. 27-inch" />
                      </Field>
                      <Field label="Resolution *">
                        <Select value={resolution} onValueChange={setResolution}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                            <SelectItem value="2K">2K (QHD)</SelectItem>
                            <SelectItem value="4K">4K (UHD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    3. Assignment, Dates & Warranty
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    
                    {showEmployeeFields && (
                      <>
                        <Field label="Assigned Employee Name *">
                          <Input value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="e.g. Ahmed Emam" />
                        </Field>
                        <Field label="Assigned Employee ID *">
                          <Input value={holderEmployeeId} onChange={(e) => setHolderEmployeeId(e.target.value)} placeholder="e.g. EMP-102" />
                        </Field>
                      </>
                    )}

                    <Field label="Supplier *">
                      <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. Raya, B.TECH" />
                    </Field>
                    <Field label="Warranty Period *">
                      <Select value={warranty} onValueChange={setWarranty}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {WARRANTY_PERIODS.map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Delivery Date *">
                      <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                    </Field>
                    <Field label="Manufacturing Date *">
                      <Input type="date" value={manufacturingDate} onChange={(e) => setManufacturingDate(e.target.value)} />
                    </Field>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 flex items-center justify-between sm:justify-between pt-3 border-t border-border/60">
          {step === 2 && !asset ? (
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1.5 font-medium">
              <ChevronLeft className="h-4 w-4" /> Change Device Type
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step === 1 ? (
            <Button onClick={() => setStep(2)} className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm">
              {asset ? "Save Changes" : "Save Asset"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}