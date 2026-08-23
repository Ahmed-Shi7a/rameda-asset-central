import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  buildMockActivity,
  buildMockAssets,
  buildMockMaintenance,
  buildMockUsers,
} from "./mock-data";
import type {
  ActivityItem,
  AppUser,
  Asset,
  MaintenanceRecord,
  PermissionKey,
  Permissions,
} from "./types";
import { defaultUserPermissions } from "./types";

const STORAGE_KEY = "ams-state-v2";

interface AppState {
  assets: Asset[];
  maintenance: MaintenanceRecord[];
  users: AppUser[];
  activity: ActivityItem[];
  currentEmployeeId: number;
  isAuthenticated: boolean;
}

function initialState(): AppState {
  return {
    assets: buildMockAssets(),
    maintenance: buildMockMaintenance(),
    users: buildMockUsers(),
    activity: buildMockActivity(),
    currentEmployeeId: 1000,
    isAuthenticated: false,
  };
}

interface AppContextValue extends AppState {
  currentUser: AppUser;
  isAdmin: boolean;
  hydrated: boolean;
  can: (key: PermissionKey) => boolean;
  login: (email: string) => boolean;
  logout: () => void;
  findUserByEmail: (email: string) => AppUser | undefined;
  addAsset: (asset: Omit<Asset, "id" | "barcode">) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  addMaintenance: (record: Omit<MaintenanceRecord, "id">) => void;
  moveAssetToMaintenance: (asset: Asset, description?: string) => void;
  disposeAsset: (asset: Asset, reason: string) => void;
  updateMaintenance: (record: MaintenanceRecord) => void;
  deleteMaintenance: (id: string) => void;
  addUser: (user: Omit<AppUser, "permissions"> & { permissions?: Permissions }) => void;
  updateUser: (user: AppUser) => void;
  setUserPermissions: (employeeId: number, permissions: Permissions) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => initialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AppState>;
      setState((prev) => ({
        assets: Array.isArray(parsed.assets) ? parsed.assets : prev.assets,
        maintenance: Array.isArray(parsed.maintenance) ? parsed.maintenance : prev.maintenance,
        users: Array.isArray(parsed.users) && parsed.users.length ? parsed.users : prev.users,
        activity: Array.isArray(parsed.activity) ? parsed.activity : prev.activity,
        currentEmployeeId:
          typeof parsed.currentEmployeeId === "number"
            ? parsed.currentEmployeeId
            : prev.currentEmployeeId,
        isAuthenticated: parsed.isAuthenticated === true,
      }));
    } catch {
      /* ignore corrupt storage */
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const logActivity = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      activity: [{ id: `act-${Date.now()}`, message, at: "Just now" }, ...prev.activity].slice(
        0,
        20,
      ),
    }));
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const currentUser =
      state.users.find((u) => u.employeeId === state.currentEmployeeId) ??
      state.users[0] ??
      buildMockUsers()[0]!;
    const isAdmin = currentUser.role === "admin";

    return {
      ...state,
      currentUser,
      isAdmin,
      hydrated,
      can: (key) => isAdmin || currentUser.permissions?.[key] === true,
      findUserByEmail: (email) =>
        state.users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()),
      login: (email) => {
        const match = state.users.find(
          (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase(),
        );
        if (!match) return false;
        setState((prev) => ({
          ...prev,
          currentEmployeeId: match.employeeId,
          isAuthenticated: true,
        }));
        return true;
      },
      logout: () => setState((prev) => ({ ...prev, isAuthenticated: false })),
      addAsset: (asset) => {
        setState((prev) => {
          const nextNumber =
            prev.assets.reduce((max, a) => {
              const n = Number(a.id.replace(/\D/g, ""));
              return Number.isFinite(n) && n > max ? n : max;
            }, 1000) + 1;
          const created: Asset = {
            ...asset,
            id: `AST-${nextNumber}`,
            barcode: `BC${90000000 + nextNumber}`,
          };
          return { ...prev, assets: [created, ...prev.assets] };
        });
        logActivity(`Asset "${asset.name}" was added`);
      },
      updateAsset: (asset) => {
        setState((prev) => ({
          ...prev,
          assets: prev.assets.map((a) => (a.id === asset.id ? asset : a)),
        }));
        logActivity(`Asset ${asset.id} was updated`);
      },
      deleteAsset: (id) => {
        setState((prev) => ({ ...prev, assets: prev.assets.filter((a) => a.id !== id) }));
        logActivity(`Asset ${id} was deleted`);
      },
      addMaintenance: (record) => {
        setState((prev) => ({
          ...prev,
          maintenance: [
            { ...record, id: `MNT-${2000 + prev.maintenance.length + 1}` },
            ...prev.maintenance,
          ],
        }));
        logActivity(`Maintenance logged for "${record.assetName}"`);
      },
      updateMaintenance: (record) => {
        setState((prev) => ({
          ...prev,
          maintenance: prev.maintenance.map((m) => (m.id === record.id ? record : m)),
        }));
        logActivity(`Maintenance ${record.id} was updated`);
      },
      deleteMaintenance: (id) => {
        setState((prev) => ({
          ...prev,
          maintenance: prev.maintenance.filter((m) => m.id !== id),
        }));
        logActivity(`Maintenance ${id} was deleted`);
      },
      addUser: (user) => {
        setState((prev) => ({
          ...prev,
          users: [
            ...prev.users,
            { ...user, permissions: user.permissions ?? defaultUserPermissions() },
          ],
        }));
        logActivity(`User "${user.fullName}" was created`);
      },
      updateUser: (user) => {
        setState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u.employeeId === user.employeeId ? user : u)),
        }));
        logActivity(`User "${user.fullName}" was updated`);
      },
      setUserPermissions: (employeeId, permissions) => {
        setState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u.employeeId === employeeId ? { ...u, permissions } : u)),
        }));
        logActivity(`Permissions updated for employee #${employeeId}`);
      },
      moveAssetToMaintenance: (asset, description) => {
        setState((prev) => ({
          ...prev,
          assets: prev.assets.map((a) =>
            a.id === asset.id ? { ...a, status: "Under Maintenance" as const } : a,
          ),
          maintenance: [
            {
              id: `MNT-${2000 + prev.maintenance.length + 1}`,
              assetName: asset.name,
              date: new Date().toISOString().slice(0, 10),
              description: description ?? `Moved to maintenance from assets (${asset.id})`,
            },
            ...prev.maintenance,
          ],
        }));
        logActivity(`Asset ${asset.id} moved to maintenance`);
      },
      disposeAsset: (asset, reason) => {
        setState((prev) => ({
          ...prev,
          assets: prev.assets.map((a) =>
            a.id === asset.id
              ? {
                  ...a,
                  status: "Scrapped" as const,
                  lastHolderName: a.holderName || a.lastHolderName || "",
                  lastHolderEmployeeId: a.holderEmployeeId || a.lastHolderEmployeeId || "",
                  holderName: "",
                  holderEmployeeId: "",
                  disposalReason: reason,
                  disposalDate: new Date().toISOString().slice(0, 10),
                }
              : a,
          ),
        }));
        logActivity(`Asset ${asset.id} was disposed / scrapped`);
      },
      resetData: () => setState(initialState()),
    };
  }, [state, hydrated, logActivity]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}