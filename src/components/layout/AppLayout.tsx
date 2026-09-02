import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Barcode as BarcodeIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  UploadCloud,
  UserCircle,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

// استدعاء اللوجو الحقيقي من المجلد
import logoAsset from "@/assets/rameda-logo.png";

import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import type { PermissionKey } from "@/lib/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionKey;
  adminOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "OPERATIONS",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/assets", label: "Assets Inventory", icon: MonitorSmartphone, permission: "assets.view" },
      { to: "/maintenance", label: "Maintenance", icon: Wrench, permission: "maintenance.view" },
      { to: "/barcode", label: "Barcode Labels", icon: BarcodeIcon, permission: "barcode.view" },
    ],
  },
  {
    title: "REPORTS & DATA",
    items: [
      { to: "/reports", label: "Analytics & Reports", icon: BarChart3, permission: "reports.view" },
      { to: "/import-export", label: "Asset Data Import", icon: UploadCloud, permission: "data.import" },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { to: "/users", label: "User Management", icon: Users, adminOnly: true },
      { to: "/profile", label: "My Profile", icon: UserCircle },
    ],
  },
];

export function AppLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { currentUser, isAdmin, can, isAuthenticated, hydrated, logout } = useApp() as any;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) navigate({ to: "/login", replace: true });
  }, [hydrated, isAuthenticated, navigate]);

  if (!hydrated || !isAuthenticated) return <div className="min-h-screen bg-background" />;

  const isVisible = (item: NavItem) => {
    if (item.adminOnly) return isAdmin;
    if (item.permission) return isAdmin || (typeof can === "function" && can(item.permission));
    return true;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/60 dark:bg-background text-foreground antialiased font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-card border-r border-border/80 transition-transform duration-200 lg:static lg:translate-x-0 shadow-sm h-full shrink-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-5 bg-card">
          <div className="flex items-center gap-3">
            {/* التعديل الأخير: اللوجو بخلفية بيضاء وبدون فلاتر */}
            <span className="grid size-10 place-items-center rounded-xl border border-[#0d9488]/25 bg-white shadow-sm p-1">
              <img 
                src={logoAsset} 
                alt="RAMEDA Logo" 
                className="w-full h-full object-contain" 
              />
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-normal text-slate-900">RAMEDA</span>
                <span className="rounded bg-[#0d9488]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#0d9488]">
                  Central
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Asset Management</p>
            </div>
          </div>
          <button
            className="text-muted-foreground hover:text-foreground lg:hidden p-1"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          {NAV_GROUPS.map((group) => {
            const filteredItems = group.items.filter(isVisible);
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {filteredItems.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: to === "/" }}
                      activeProps={{
                        className: "bg-[#0d9488]/10 text-[#0d9488] font-bold [&>span.indicator]:opacity-100",
                      }}
                      className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted/70 hover:text-slate-900"
                    >
                      <span className="indicator absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#0d9488] opacity-0 transition-opacity" />
                      <Icon className="size-4 shrink-0 transition-transform group-hover:scale-105" />
                      <span className="truncate">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Card Footer */}
        <div className="border-t border-border/70 p-3 bg-card shrink-0">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 border border-border/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-8 place-items-center rounded-lg bg-[#0d9488]/10 text-[#0d9488]">
                <UserCircle className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{currentUser?.fullName || "Ahmed Emam"}</p>
                <p className="truncate text-[10px] text-muted-foreground font-medium">
                  {currentUser?.role === "admin" ? "Administrator" : "Standard User"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/login", replace: true });
              }}
              title="Sign out"
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="no-print fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-y-auto">
        {/* Topbar Header */}
        <header className="no-print sticky top-0 z-20 flex min-h-[4rem] shrink-0 items-center justify-between border-b border-border/70 bg-card/95 px-4 sm:px-6 py-2 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="text-muted-foreground hover:text-foreground lg:hidden p-1"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-normal text-foreground truncate">
                {title}
              </h1>
              {description ? (
                <p className="hidden md:block text-xs text-muted-foreground truncate font-normal mt-0.5">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}

            <div className="hidden h-5 w-[1px] bg-border sm:block" />

            <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Link to="/profile" aria-label="Profile">
                <UserCircle className="size-5 text-muted-foreground hover:text-foreground" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}