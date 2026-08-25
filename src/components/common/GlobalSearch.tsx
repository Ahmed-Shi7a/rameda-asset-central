import { useEffect, useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { 
  Search, 
  MonitorSmartphone, 
  UploadCloud, 
  Wrench, 
  Barcode, 
  BarChart3, 
  Laptop, 
  MapPin, 
  User, 
  X 
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { StatusBadge } from "@/components/common/StatusBadge";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { assets = [] } = useApp() as any;

  // إغلاق القائمة عند النقر في أي مكان خارجها أو الضغط على Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredAssets = query.trim() === "" 
    ? [] 
    : assets.filter((a: any) => {
        const q = query.toLowerCase();
        return (
          a.name?.toLowerCase().includes(q) ||
          a.serialNumber?.toLowerCase().includes(q) ||
          a.holderName?.toLowerCase().includes(q) ||
          a.holderEmployeeId?.toLowerCase().includes(q) ||
          a.brand?.toLowerCase().includes(q) ||
          a.model?.toLowerCase().includes(q) ||
          a.location?.toLowerCase().includes(q)
        );
      }).slice(0, 5);

  return (
    <div ref={containerRef} className="relative w-64 sm:w-80">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search serial, asset, staff..."
          className="h-9 w-full rounded-xl border border-border/70 bg-muted/40 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground shadow-sm focus:border-teal-500 focus:bg-background focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
        />
        {query ? (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-2.5 pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[9px] font-medium text-muted-foreground sm:inline-flex">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Floating Dropdown Without Screen Dimming */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-[420px] rounded-2xl border border-border/80 bg-card p-2.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {query.trim() !== "" ? (
            <div className="space-y-2">
              <p className="px-2 text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                Matching Assets ({filteredAssets.length})
              </p>
              {filteredAssets.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No assets found matching "<span className="font-semibold text-foreground">{query}</span>"
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filteredAssets.map((asset: any) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        navigate({ to: "/assets" });
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/60 cursor-pointer border border-transparent hover:border-border/60 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 shrink-0">
                          <Laptop className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{asset.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className="font-mono">{asset.serialNumber}</span>
                            <span>&bull;</span>
                            <span className="truncate">{asset.location}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={asset.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Quick Links
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => { navigate({ to: "/assets" }); setIsOpen(false); }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 text-foreground text-left transition-colors"
                >
                  <MonitorSmartphone className="size-3.5 text-teal-600" />
                  <span>Assets Inventory</span>
                </button>
                <button
                  type="button"
                  onClick={() => { navigate({ to: "/import-export" }); setIsOpen(false); }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 text-foreground text-left transition-colors"
                >
                  <UploadCloud className="size-3.5 text-teal-600" />
                  <span>Asset Import</span>
                </button>
                <button
                  type="button"
                  onClick={() => { navigate({ to: "/maintenance" }); setIsOpen(false); }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 text-foreground text-left transition-colors"
                >
                  <Wrench className="size-3.5 text-teal-600" />
                  <span>Maintenance</span>
                </button>
                <button
                  type="button"
                  onClick={() => { navigate({ to: "/reports" }); setIsOpen(false); }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 text-foreground text-left transition-colors"
                >
                  <BarChart3 className="size-3.5 text-teal-600" />
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}