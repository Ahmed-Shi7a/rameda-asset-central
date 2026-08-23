import {
  defaultUserPermissions,
  makePermissions,
  type ActivityItem,
  type AppUser,
  type Asset,
  type AssetStatus,
  type MaintenanceRecord,
} from "./types";

function at<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length] as T;
}

const brands = ["Dell", "HP", "Lenovo", "Apple", "Asus", "Canon", "Epson", "Cisco"];
const types = ["Laptop", "Desktop", "Printer", "Monitor", "Scanner", "Server", "Tablet"];
const locations = [
  "HQ (Headquarters)",
  "Alexandria Scientific Office (ALX-SO)",
  "Mansoura Scientific Office (MNS-SO)",
  "Tanta Scientific Office (TNT-SO)",
  "Zagazig Scientific Office (ZGZ-SO)",
  "Assiut Scientific Office (AST-SO)",
  "Sohag Scientific Office (SHG-SO)",
  "Aswan Scientific Office (ASW-SO)",
  "Luxor Scientific Office (LXR-SO)",
  "Port Said Scientific Office (PSD-SO)",
  "Suez Scientific Office (SUZ-SO)",
  "Ismailia Scientific Office (ISM-SO)",
  "Cairo & Giza Scientific Office (CGO-SO)",
];
const statuses: AssetStatus[] = ["Active", "Stock", "Under Maintenance"];
const holders = [
  ["Ahmed Emam", "1001"],
  ["Mona Saleh", "1002"],
  ["Youssef Hany", "1003"],
  ["Sara Adel", "1004"],
  ["Khaled Nabil", "1005"],
  ["", ""],
];

export function buildMockAssets(): Asset[] {
  return Array.from({ length: 28 }, (_, i) => {
    const type = at(types, i);
    const brand = at(brands, i);
    const holder = at(holders, i);
    const status = at(statuses, i);
    const model = `${brand} ${type} ${1200 + i * 7}`;
    return {
      id: `AST-${String(1001 + i)}`,
      barcode: `BC${String(90010001 + i)}`,
      name: model,
      deviceType: type,
      brand,
      model: `M-${1200 + i * 7}`,
      serialNumber: `SN${String(50231 + i * 31)}`,
      ram: at(["8 GB", "16 GB", "32 GB", "-"], i),
      processor: at(["Intel i5", "Intel i7", "AMD Ryzen 5", "Apple M2"], i),
      memory: at(["256 GB", "512 GB", "1 TB", "2 TB"], i),
      hardDiskType: at(["SSD", "HDD", "NVMe"], i),
      location: at(locations, i),
      holderName: status === "Stock" ? "" : at(holder, 0),
      holderEmployeeId: status === "Stock" ? "" : at(holder, 1),
      deliveryDate: `2025-${String((i % 12) + 1).padStart(2, "0")}-1${i % 9}`,
      manufacturingDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-0${(i % 9) + 1}`,
      warranty: at(["1 Year", "2 Years", "3 Years", "Expired"], i),
      supplier: at(["Raya", "Mideast", "Compume", "Elaraby"], i),
      status,
    } satisfies Asset;
  });
}

export function buildMockMaintenance(): MaintenanceRecord[] {
  const descs = [
    "Screen replacement",
    "OS reinstall and cleanup",
    "Toner replacement",
    "Battery replacement",
    "Fan cleaning and thermal paste",
    "Motherboard diagnostics",
  ];
  return Array.from({ length: 14 }, (_, i) => ({
    id: `MNT-${2001 + i}`,
    assetName: `${at(brands, i)} ${at(types, i)} ${1200 + i * 7}`,
    date: `2026-${String((i % 8) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    description: at(descs, i),
    cost: i % 4 === 0 ? undefined : 500 + i * 275,
  }));
}

export function buildMockUsers(): AppUser[] {
  const admin: AppUser = {
    employeeId: 1000,
    fullName: "Ahmed Emam",
    email: "ahmed.emam@company.com",
    phone: "+20 100 123 4567",
    role: "admin",
    status: "Active",
    permissions: makePermissions(true),
  };
  const rest: AppUser[] = [
    ["Mona Saleh", "mona.saleh@company.com", 1002, "Active"],
    ["Youssef Hany", "youssef.hany@company.com", 1003, "Active"],
    ["Sara Adel", "sara.adel@company.com", 1004, "Inactive"],
    ["Khaled Nabil", "khaled.nabil@company.com", 1005, "Active"],
    ["Nour Hassan", "nour.hassan@company.com", 1006, "Inactive"],
  ].map(([fullName, email, employeeId, status], i) => ({
    fullName: fullName as string,
    email: email as string,
    employeeId: employeeId as number,
    phone: `+20 10${i} 555 12${i}4`,
    role: "user" as const,
    status: status as AppUser["status"],
    permissions: defaultUserPermissions(),
  }));
  return [admin, ...rest];
}

export function buildMockActivity(): ActivityItem[] {
  return [
    { id: "a1", message: "Ahmed Emam added asset AST-1028 (Dell Laptop)", at: "10 minutes ago" },
    { id: "a2", message: "Maintenance MNT-2013 marked completed", at: "1 hour ago" },
    { id: "a3", message: "Mona Saleh printed barcode for AST-1004", at: "3 hours ago" },
    { id: "a4", message: "Permissions updated for Youssef Hany", at: "Yesterday" },
    { id: "a5", message: "Asset AST-1011 moved to Stock", at: "2 days ago" },
  ];
}