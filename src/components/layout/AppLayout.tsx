import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Barcode as BarcodeIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  ShieldCheck,
  UploadCloud,
  UserCircle,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

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
      { to: "/import-export", label: "Import Data", icon: UploadCloud, permission: "data.import" },
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
  const { currentUser, isAdmin, can, isAuthenticated, hydrated, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) navigate({ to: "/login", replace: true });
  }, [hydrated, isAuthenticated, navigate]);

  if (!hydrated || !isAuthenticated) return <div className="min-h-screen bg-background" />;

  const isVisible = (item: NavItem) => {
    if (item.adminOnly) return isAdmin;
    if (item.permission) return can(item.permission);
    return true;
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 dark:bg-background text-foreground antialiased">
      {/* Light Harmonized Sidebar */}
      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-card border-r border-border/80 transition-transform duration-200 lg:static lg:translate-x-0 shadow-sm",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/70 px-5 bg-card">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <ShieldCheck className="size-5" />
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-foreground">AssetFlow</span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">v2.0</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Rameda Management</p>
            </div>
          </div>
          <button
            className="text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Sections */}
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
                      className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                    >
                      {/* Active Indicator Bar */}
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
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
        <div className="border-t border-border/70 p-3 bg-card">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 border border-border/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <UserCircle className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{currentUser.fullName}</p>
                <p className="truncate text-[10px] text-muted-foreground font-medium">
                  {currentUser.role === "admin" ? "Administrator" : "Standard User"}
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
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Single Topbar Header */}
        <header className="no-print sticky top-0 z-20 flex min-h-[4rem] items-center justify-between border-b border-border/70 bg-card/95 px-4 sm:px-6 py-2 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="text-muted-foreground hover:text-foreground lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                {title}
              </h1>
              {description ? (
                <p className="hidden md:block text-xs text-muted-foreground truncate">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}