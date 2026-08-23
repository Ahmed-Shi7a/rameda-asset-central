import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Laptop,
  Monitor,
  Printer,
  Scan,
  Server,
  Tablet,
  Network,
  PackageCheck,
  ChevronLeft,
  ArrowRight,
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

export const APP_DEVICE_TYPES = [
  { id: "Laptop", label: "Laptop", icon: Laptop, desc: "Notebooks & Ultrabooks" },
  { id: "Desktop", label: "Desktop", icon: Monitor, desc: "PC Towers & All-in-Ones" },
  { id: "Tablet", label: "Tablet", icon: Tablet, desc: "iPads & Tablets" },
  { id: "Printer", label: "Printer", icon: Printer, desc: "Laser, Inkjet & Multi" },
  { id: "Scanner", label: "Scanner", icon: Scan, desc: "Flatbed & Feeder" },
  { id: "Network Device", label: "Network Device", icon: Network, desc: "Switches, Routers & APs" },
  { id: "Server", label: "Server", icon: Server, desc: "Rack & Tower Servers" },
  { id: "Monitor", label: "Monitor", icon: Monitor, desc: "Screens & Displays" },
  { id: "Other", label: "Other", icon: PackageCheck, desc: "Accessories & Peripherals" },
] as const;

const WARRANTY_PERIODS = ["1 Year", "2 Years", "3 Years", "5 Years", "No Warranty"] as const;

interface AddAssetDialogProps {
  open: boolean;
  asset: Asset | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: Omit<Asset, "id" | "barcode">) => void;
}

export function AddAssetDialog({ open, asset, onOpenChange, onSubmit }: AddAssetDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<string>("Laptop");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState<AssetStatus>("Active");
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [holderName, setHolderName] = useState("");
  const [holderEmployeeId, setHolderEmployeeId] = useState("");
  const [supplier, setSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [warranty, setWarranty] = useState("1 Year");

  const [processor, setProcessor] = useState("");
  const [ram, setRam] = useState("");
  const [hardDiskType, setHardDiskType] = useState("SSD");
  const [memory, setMemory] = useState("");
  const [gpu, setGpu] = useState("");
  const [imei, setImei] = useState("");
  const [screenSize, setScreenSize] = useState("");
  const [connectivity, setConnectivity] = useState("Wi-Fi");
  const [printerType, setPrinterType] = useState("Laser");
  const [printOutput, setPrintOutput] = useState("Monochrome");
  const [cartridgeModel, setCartridgeModel] = useState("");
  const [scanResolution, setScanResolution] = useState("");
  const [scannerType, setScannerType] = useState("Flatbed");
  const [interfaceType, setInterfaceType] = useState("USB");
  const [networkCategory, setNetworkCategory] = useState("Switch");
  const [portCount, setPortCount] = useState("24 Ports");
  const [managementType, setManagementType] = useState("Managed");
  const [ipMacAddress, setIpMacAddress] = useState("");
  const [raidConfig, setRaidConfig] = useState("RAID 1");
  const [formFactor, setFormFactor] = useState("Rack");
  const [operatingSystem, setOperatingSystem] = useState("");
  const [staticIp, setStaticIp] = useState("");
  const [resolution, setResolution] = useState("1080p");
  const [panelType, setPanelType] = useState("IPS");
  const [displayPorts, setDisplayPorts] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setStep(1);
    setSelectedType("Laptop");
    setName("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setStatus("Active");
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
    setConnectivity("Wi-Fi");
    setPrinterType("Laser");
    setPrintOutput("Monochrome");
    setCartridgeModel("");
    setScanResolution("");
    setScannerType("Flatbed");
    setInterfaceType("USB");
    setNetworkCategory("Switch");
    setPortCount("24 Ports");
    setManagementType("Managed");
    setIpMacAddress("");
    setRaidConfig("RAID 1");
    setFormFactor("Rack");
    setOperatingSystem("");
    setStaticIp("");
    setResolution("1080p");
    setPanelType("IPS");
    setDisplayPorts("");
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
      setStatus(asset.status || "Active");
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
      setConnectivity(asset.connectivity || "Wi-Fi");
      setPrinterType(asset.printerType || "Laser");
      setPrintOutput(asset.printOutput || "Monochrome");
      setCartridgeModel(asset.cartridgeModel || "");
      setScanResolution(asset.scanResolution || "");
      setScannerType(asset.scannerType || "Flatbed");
      setInterfaceType(asset.interfaceType || "USB");
      setNetworkCategory(asset.networkCategory || "Switch");
      setPortCount(asset.portCount || "24 Ports");
      setManagementType(asset.managementType || "Managed");
      setIpMacAddress(asset.ipMacAddress || "");
      setRaidConfig(asset.raidConfig || "RAID 1");
      setFormFactor(asset.formFactor || "Rack");
      setOperatingSystem(asset.operatingSystem || "");
      setStaticIp(asset.staticIp || "");
      setResolution(asset.resolution || "1080p");
      setPanelType(asset.panelType || "IPS");
      setDisplayPorts(asset.displayPorts || "");
      setNotes(asset.notes || "");
    }
  }, [open, asset]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter asset name.");
      return;
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
      scanResolution,
      interfaceType,
      networkCategory,
      portCount,
      ipMacAddress,
      raidConfig,
      formFactor,
      operatingSystem,
      staticIp,
      resolution,
      panelType,
      displayPorts,
      notes,
      connectivity,
      cartridgeModel,
      scannerType,
      managementType,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {asset ? `Edit: ${asset.name}` : `Add New Asset (${selectedType})`}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Select the hardware category to configure the right fields."
              : `Fill in the required information for this ${selectedType}.`}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="py-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {APP_DEVICE_TYPES.map((d) => {
                const Icon = d.icon;
                const isSelected = selectedType === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedType(d.id);
                      setStep(2);
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl border p-5 text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border/70 hover:border-primary hover:bg-muted/40"
                    }`}
                  >
                    <Icon className="mb-2 h-8 w-8" />
                    <span className="text-sm font-semibold">{d.label}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">{d.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {selectedType === "Other" ? (
              <div className="space-y-3">
                <Field label="Item Name *">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wireless Ergonomic Mouse" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Brand / Manufacturer">
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Logitech, Anker" />
                  </Field>
                  <Field label="Location">
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
                <Field label="Item Description & Notes">
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
                <div className="rounded-lg border border-border/70 p-4">
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
                    <Field label="Brand">
                      <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Dell, HP, Apple" />
                    </Field>
                    <Field label="Model">
                      <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Latitude 5420, M-102" />
                    </Field>
                    <Field label="Status">
                      <Select value={status} onValueChange={(v) => setStatus(v as AssetStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ASSET_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Location">
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

                <div className="rounded-lg border border-primary/40 bg-primary/[0.03] p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                    2. {selectedType} Hardware Specs
                  </h4>

                  {(selectedType === "Laptop" || selectedType === "Desktop") && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Processor (CPU)">
                        <Input value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="e.g. Intel Core i7-12700H" />
                      </Field>
                      <Field label="RAM (GB)">
                        <Input value={ram} onChange={(e) => setRam(e.target.value)} placeholder="e.g. 16 GB" />
                      </Field>
                      <Field label="Hard Disk Type">
                        <Select value={hardDiskType} onValueChange={setHardDiskType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SSD">SSD</SelectItem>
                            <SelectItem value="HDD">HDD</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Storage Capacity">
                        <Input value={memory} onChange={(e) => setMemory(e.target.value)} placeholder="e.g. 512 GB" />
                      </Field>
                      <Field label="Graphic Card (GPU)">
                        <Input value={gpu} onChange={(e) => setGpu(e.target.value)} placeholder="e.g. RTX 3050 / Iris Xe" />
                      </Field>
                    </div>
                  )}

                  {selectedType === "Tablet" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="IMEI Number *">
                        <Input value={imei} onChange={(e) => setImei(e.target.value)} placeholder="e.g. 354890123456789" />
                      </Field>
                      <Field label="Screen Size (Inches)">
                        <Input value={screenSize} onChange={(e) => setScreenSize(e.target.value)} placeholder="e.g. 10.9-inch" />
                      </Field>
                      <Field label="RAM">
                        <Input value={ram} onChange={(e) => setRam(e.target.value)} placeholder="e.g. 8 GB" />
                      </Field>
                      <Field label="Storage Capacity">
                        <Input value={memory} onChange={(e) => setMemory(e.target.value)} placeholder="e.g. 128 GB" />
                      </Field>
                      <Field label="Connectivity">
                        <Select value={connectivity} onValueChange={setConnectivity}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Wi-Fi">Wi-Fi Only</SelectItem>
                            <SelectItem value="Wi-Fi + Cellular (4G/5G)">Wi-Fi + Cellular (4G/5G)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  )}

                  {selectedType === "Printer" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Printer Type">
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
                      <Field label="Print Color">
                        <Select value={printOutput} onValueChange={setPrintOutput}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monochrome">Monochrome (Black & White)</SelectItem>
                            <SelectItem value="Color">Color</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Connection Interface">
                        <Select value={connectivity} onValueChange={setConnectivity}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Network IP">Network IP (Ethernet / Wi-Fi)</SelectItem>
                            <SelectItem value="USB Only">USB Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Cartridge / Toner Model">
                        <Input value={cartridgeModel} onChange={(e) => setCartridgeModel(e.target.value)} placeholder="e.g. HP 26A / CF226A" />
                      </Field>
                    </div>
                  )}

                  {selectedType === "Scanner" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Scan Resolution (DPI)">
                        <Input value={scanResolution} onChange={(e) => setScanResolution(e.target.value)} placeholder="e.g. 600 x 1200 DPI" />
                      </Field>
                      <Field label="Scanner Type">
                        <Select value={scannerType} onValueChange={setScannerType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Flatbed">Flatbed</SelectItem>
                            <SelectItem value="Document Feeder (ADF)">Document Feeder (ADF)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Interface Type">
                        <Select value={interfaceType} onValueChange={setInterfaceType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USB">USB</SelectItem>
                            <SelectItem value="Network Ethernet">Network Ethernet</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  )}

                  {selectedType === "Network Device" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Device Category">
                        <Select value={networkCategory} onValueChange={setNetworkCategory}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Managed Switch">Managed Switch</SelectItem>
                            <SelectItem value="Unmanaged Switch">Unmanaged Switch</SelectItem>
                            <SelectItem value="Router">Router</SelectItem>
                            <SelectItem value="Access Point (AP)">Access Point (AP)</SelectItem>
                            <SelectItem value="Firewall">Firewall</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Port Count">
                        <Select value={portCount} onValueChange={setPortCount}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8 Ports">8 Ports</SelectItem>
                            <SelectItem value="16 Ports">16 Ports</SelectItem>
                            <SelectItem value="24 Ports">24 Ports</SelectItem>
                            <SelectItem value="48 Ports">48 Ports</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Management">
                        <Select value={managementType} onValueChange={setManagementType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Managed">Managed (Layer 2 / Layer 3)</SelectItem>
                            <SelectItem value="Unmanaged">Unmanaged</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="IP / MAC Address">
                        <Input value={ipMacAddress} onChange={(e) => setIpMacAddress(e.target.value)} placeholder="e.g. 192.168.1.1 / 00:1A:2B:3C:4D:5E" />
                      </Field>
                    </div>
                  )}

                  {selectedType === "Server" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="CPU & Cores">
                        <Input value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="e.g. 2x Xeon Silver (32 Cores)" />
                      </Field>
                      <Field label="RAM (GB)">
                        <Input value={ram} onChange={(e) => setRam(e.target.value)} placeholder="e.g. 64 GB ECC" />
                      </Field>
                      <Field label="RAID Configuration">
                        <Select value={raidConfig} onValueChange={setRaidConfig}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No RAID">No RAID</SelectItem>
                            <SelectItem value="RAID 0">RAID 0</SelectItem>
                            <SelectItem value="RAID 1">RAID 1</SelectItem>
                            <SelectItem value="RAID 5">RAID 5</SelectItem>
                            <SelectItem value="RAID 10">RAID 10</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Form Factor">
                        <Select value={formFactor} onValueChange={setFormFactor}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Rack">Rackmount (1U / 2U / 4U)</SelectItem>
                            <SelectItem value="Tower">Tower</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Operating System">
                        <Input value={operatingSystem} onChange={(e) => setOperatingSystem(e.target.value)} placeholder="e.g. Windows Server 2022" />
                      </Field>
                      <Field label="Static IP Address">
                        <Input value={staticIp} onChange={(e) => setStaticIp(e.target.value)} placeholder="e.g. 10.0.0.15" />
                      </Field>
                    </div>
                  )}

                  {selectedType === "Monitor" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Screen Size (Inches)">
                        <Input value={screenSize} onChange={(e) => setScreenSize(e.target.value)} placeholder="e.g. 27-inch" />
                      </Field>
                      <Field label="Resolution">
                        <Select value={resolution} onValueChange={setResolution}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                            <SelectItem value="2K">2K (QHD)</SelectItem>
                            <SelectItem value="4K">4K (UHD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Panel Type">
                        <Select value={panelType} onValueChange={setPanelType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IPS">IPS</SelectItem>
                            <SelectItem value="VA">VA</SelectItem>
                            <SelectItem value="TN">TN</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Video Ports">
                        <Input value={displayPorts} onChange={(e) => setDisplayPorts(e.target.value)} placeholder="e.g. HDMI, DisplayPort, Type-C" />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    3. Assignment, Dates & Warranty
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Assigned Employee Name">
                      <Input value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="e.g. Ahmed Emam (or leave blank)" />
                    </Field>
                    <Field label="Assigned Employee ID">
                      <Input value={holderEmployeeId} onChange={(e) => setHolderEmployeeId(e.target.value)} placeholder="e.g. EMP-102" />
                    </Field>
                    <Field label="Supplier">
                      <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. Raya, B.TECH" />
                    </Field>
                    <Field label="Warranty Period">
                      <Select value={warranty} onValueChange={setWarranty}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {WARRANTY_PERIODS.map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Delivery Date">
                      <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                    </Field>
                    <Field label="Manufacturing Date">
                      <Input type="date" value={manufacturingDate} onChange={(e) => setManufacturingDate(e.target.value)} />
                    </Field>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 flex items-center justify-between sm:justify-between">
          {step === 2 && !asset ? (
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Change Device Type
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step === 1 ? (
            <Button onClick={() => setStep(2)} className="gap-1">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>{asset ? "Save Changes" : "Save Asset"}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      {children}
    </div>
  );
}