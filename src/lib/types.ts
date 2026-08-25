export type UserRole = "admin" | "user";
export type UserStatus = "Active" | "Inactive";

export type AssetStatus = "Active" | "Stock - New" | "Stock - Used" | "Under Maintenance" | "Scrapped";

export type PermissionKey =
  | "assets.view"
  | "assets.create"
  | "assets.edit"
  | "assets.delete"
  | "maintenance.view"
  | "maintenance.create"
  | "maintenance.edit"
  | "maintenance.delete"
  | "barcode.view"
  | "barcode.scan"
  | "barcode.print"
  | "reports.view"
  | "reports.export"
  | "data.import"
  | "data.export"
  | "import_export.import"
  | "import_export.export";

export const ASSET_STATUSES: AssetStatus[] = [
  "Active",
  "Stock - New",
  "Stock - Used",
  "Under Maintenance",
  "Scrapped",
];

export const DEVICE_TYPES = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Printer",
  "Tablet",
  "Mobile Phone",
  "Other",
] as const;

export const LOCATIONS = [
  "HQ (Headquarters)",
  "Alexandria Scientific Office",
  "Mansoura Scientific Office",
  "Tanta Scientific Office",
  "Zagazig Scientific Office",
  "Assiut Scientific Office",
  "Sohag Scientific Office",
  "Aswan Scientific Office",
] as const;

export interface Asset {
  id: string;
  name?: string;
  tagNumber?: string;
  deviceType?: string;
  hardwareType?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: AssetStatus;
  location: string;
  supplier?: string;
  holderEmployeeId?: string;
  assignedEmployee?: string;
  holderName?: string;
  assignedTo?: string;
  deliveryDate?: string;
  manufacturingDate?: string;
  purchaseDate?: string;
  warrantyMonths?: number;
  warranty?: string;
  processor?: string;
  ram?: string;
  hardDiskType?: string;
  memory?: string;
  gpu?: string;
  imei?: string;
  screenSize?: string;
  printerType?: string;
  printOutput?: string;
  cartridgeModel?: string;
  resolution?: string;
  notes?: string;
  cost?: number;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName?: string;
  issue: string;
  cost?: number;
  status: "Pending" | "In-Progress" | "Completed";
  date?: string;
  technician?: string;
}

export interface MaintenanceJob extends MaintenanceRecord {}

export interface Permissions {
  [key: string]: boolean;
}

export interface AppUser {
  employeeId: number;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permissions;
}

export const PERMISSION_GROUPS = [
  {
    group: "Assets Inventory",
    items: [
      { key: "assets.view", label: "View Assets" },
      { key: "assets.create", label: "Add Asset" },
      { key: "assets.edit", label: "Edit Asset" },
      { key: "assets.delete", label: "Delete Asset" },
    ],
  },
  {
    group: "Maintenance Operations",
    items: [
      { key: "maintenance.view", label: "View Maintenance" },
      { key: "maintenance.create", label: "Add Maintenance" },
      { key: "maintenance.edit", label: "Edit Maintenance" },
      { key: "maintenance.delete", label: "Delete Maintenance" },
    ],
  },
  {
    group: "Barcode & Labels",
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
      { key: "reports.export", label: "Export Reports (PDF / Excel / CSV)" },
      { key: "import_export.import", label: "Import Data" },
      { key: "import_export.export", label: "Export Data" },
    ],
  },
] as const;

export function makePermissions(overrides: Partial<Permissions> = {}): Permissions {
  const base: Permissions = {
    "assets.view": false,
    "assets.create": false,
    "assets.edit": false,
    "assets.delete": false,
    "maintenance.view": false,
    "maintenance.create": false,
    "maintenance.edit": false,
    "maintenance.delete": false,
    "barcode.view": false,
    "barcode.scan": false,
    "barcode.print": false,
    "reports.view": false,
    "reports.export": false,
    "import_export.import": false,
    "import_export.export": false,
    "data.import": false,
    "data.export": false,
  };
  return { ...base, ...overrides };
}

export function defaultUserPermissions(): Permissions {
  return makePermissions({
    "assets.view": true,
    "maintenance.view": true,
    "barcode.view": true,
    "barcode.scan": true,
    "reports.view": true,
  });
}