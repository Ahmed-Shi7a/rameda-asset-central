export type UserRole = "admin" | "user";
export type UserStatus = "Active" | "Inactive";
export type AssetStatus = "Stock" | "In-Use" | "Under Maintenance" | "Scrapped";

export const ASSET_STATUSES: AssetStatus[] = [
  "Stock",
  "In-Use",
  "Under Maintenance",
  "Scrapped",
];

export interface Asset {
  id: string;
  name: string;
  hardwareType: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  location: string;
  assignedEmployee?: string;
  deliveryDate?: string;
  warrantyMonths?: number;
  notes?: string;
}

export interface MaintenanceJob {
  id: string;
  assetId: string;
  assetName: string;
  issue: string;
  cost: number;
  status: "Pending" | "In-Progress" | "Completed";
  date: string;
  technician?: string;
}

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
  {
    group: "User Management",
    items: [
      { key: "users.view", label: "View Users List" },
      { key: "users.create", label: "Add New User" },
      { key: "users.delete", label: "Delete User" },
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
    "users.view": false,
    "users.create": false,
    "users.delete": false,
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