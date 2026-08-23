export type Role = "admin" | "user";
export type AssetStatus = "Active" | "Stock" | "Under Maintenance" | "Scrapped";
export type UserStatus = "Active" | "Inactive";

export type PermissionKey =
  | "assets.view"
  | "assets.add"
  | "assets.edit"
  | "assets.delete"
  | "maintenance.view"
  | "maintenance.add"
  | "maintenance.edit"
  | "maintenance.delete"
  | "barcode.view"
  | "barcode.scan"
  | "barcode.print"
  | "reports.view"
  | "reports.export"
  | "data.import"
  | "data.export";

export type Permissions = Record<PermissionKey, boolean>;

export interface AppUser {
  employeeId: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  permissions: Permissions;
}

export interface Asset {
  id: string;
  barcode: string;
  name: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  ram: string;
  processor: string;
  memory: string;
  hardDiskType: string;
  location: string;
  holderName: string;
  holderEmployeeId: string;
  deliveryDate: string;
  manufacturingDate: string;
  warranty: string;
  supplier: string;
  status: AssetStatus;
  disposalDate?: string | undefined;
  disposalReason?: string | undefined;
  lastHolderName?: string | undefined;
  lastHolderEmployeeId?: string | undefined;
  // Type-specific specs
  imei?: string | undefined;
  screenSize?: string | undefined;
  printerType?: string | undefined;
  printOutput?: string | undefined;
  ipAddress?: string | undefined;
  scanResolution?: string | undefined;
  interfaceType?: string | undefined;
  networkCategory?: string | undefined;
  portCount?: string | undefined;
  ipMacAddress?: string | undefined;
  raidConfig?: string | undefined;
  formFactor?: string | undefined;
  operatingSystem?: string | undefined;
  notes?: string | undefined;
  gpu?: string | undefined;
  connectivity?: string | undefined;
  cartridgeModel?: string | undefined;
  scannerType?: string | undefined;
  managementType?: string | undefined;
  staticIp?: string | undefined;
  resolution?: string | undefined;
  panelType?: string | undefined;
  displayPorts?: string | undefined;
  subType?: string | undefined;
}

export interface MaintenanceRecord {
  id: string;
  assetName: string;
  date: string;
  description: string;
  cost?: number | undefined;
}

export interface ActivityItem {
  id: string;
  message: string;
  at: string;
}

export const PERMISSION_GROUPS: {
  group: string;
  items: { key: PermissionKey; label: string }[];
}[] = [
  {
    group: "Assets",
    items: [
      { key: "assets.view", label: "View Assets" },
      { key: "assets.add", label: "Add Asset" },
      { key: "assets.edit", label: "Edit Asset" },
      { key: "assets.delete", label: "Delete Asset" },
    ],
  },
  {
    group: "Maintenance",
    items: [
      { key: "maintenance.view", label: "View Maintenance" },
      { key: "maintenance.add", label: "Add Maintenance" },
      { key: "maintenance.edit", label: "Edit Maintenance" },
      { key: "maintenance.delete", label: "Delete Maintenance" },
    ],
  },
  {
    group: "Barcode",
    items: [
      { key: "barcode.view", label: "View Barcode" },
      { key: "barcode.scan", label: "Scan Barcode" },
      { key: "barcode.print", label: "Print Barcode" },
    ],
  },
  {
    group: "Reports & Data",
    items: [
      { key: "reports.view", label: "View Reports" },
      { key: "reports.export", label: "Export Reports" },
      { key: "data.import", label: "Import Data" },
      { key: "data.export", label: "Export Data" },
    ],
  },
];

export const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) =>
  g.items.map((i) => i.key),
);

export function makePermissions(value: boolean): Permissions {
  return ALL_PERMISSION_KEYS.reduce((acc, key) => {
    acc[key] = value;
    return acc;
  }, {} as Permissions);
}

export function defaultUserPermissions(): Permissions {
  const p = makePermissions(false);
  p["assets.view"] = true;
  p["maintenance.view"] = true;
  p["barcode.view"] = true;
  p["barcode.scan"] = true;
  p["reports.view"] = true;
  return p;
}

export const LOCATIONS = [
  "AO-",
  "ASI-",
  "CO-",
  "HQ-",
  "MO-",
  "TO-",
  "ZO-",
] as const;

export const DEVICE_TYPES = [
  "Laptop",
  "Desktop",
  "Printer",
  "Monitor",
  "Scanner",
  "Server",
  "Tablet",
  "Network Device",
  "Other",
] as const;

export const ASSET_STATUSES: AssetStatus[] = [
  "Active",
  "Stock",
  "Under Maintenance",
  "Scrapped",
];