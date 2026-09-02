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

const STORAGE_KEY = "rameda-ams-state-v2";

interface AppState {
  assets: Asset[];
  maintenance: MaintenanceRecord[];
  users: AppUser[];
  activity: ActivityItem[];
  currentEmployeeId: number;
  isAuthenticated: boolean;
}

// 🟢 MOCK INITIAL STATE (Smart LocalStorage fallback for seamless session & roles)
function initialState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      const users = Array.isArray(parsed.users) && parsed.users.length ? parsed.users : buildMockUsers();
      return {
        assets: Array.isArray(parsed.assets) && parsed.assets.length ? parsed.assets : buildMockAssets(),
        maintenance: Array.isArray(parsed.maintenance) ? parsed.maintenance : buildMockMaintenance(),
        users: users,
        activity: Array.isArray(parsed.activity) ? parsed.activity : buildMockActivity(),
        currentEmployeeId: typeof parsed.currentEmployeeId === "number" ? parsed.currentEmployeeId : (users[0]?.employeeId ?? 1000),
        isAuthenticated: parsed.isAuthenticated === true,
      };
    }
  } catch (e) {
    console.error("Failed to load state from storage:", e);
  }

  const users = buildMockUsers();
  return {
    assets: buildMockAssets(),
    maintenance: buildMockMaintenance(),
    users: users,
    activity: buildMockActivity(),
    currentEmployeeId: users[0]?.employeeId ?? 1000,
    isAuthenticated: true,
  };
}

interface AppContextValue extends AppState {
  currentUser: AppUser;
  isAdmin: boolean;
  hydrated: boolean;
  can: (key: PermissionKey) => boolean;
  login: (userData: any) => void;
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
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated] = useState(true);

  // 💾 حفظ الحالة في الـ localStorage لتجنب فقدان السشن أو الحاجة للريفريش المستمر
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }, [state]);

  /* ========================================================================= */
  /* 🚨🚨🚨 BACKEND TEAM: UNCOMMENT THIS TO FETCH REAL DATA ON LOAD 🚨🚨🚨 */
  /* ========================================================================= */
  /*
  useEffect(() => {
    if (!state.isAuthenticated) return;
    
    async function fetchRealDatabase() {
      try {
        const token = localStorage.getItem("token");
        const assetsRes = await fetch("https://api.yourdomain.com/api/assets", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const realAssets = await assetsRes.json();

        const maintRes = await fetch("https://api.yourdomain.com/api/maintenance", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const realMaintenance = await maintRes.json();

        setState(prev => ({
          ...prev,
          assets: realAssets,
          maintenance: realMaintenance
        }));
      } catch (error) {
        console.error("Failed to fetch real data:", error);
      }
    }
    
    fetchRealDatabase();
  }, [state.isAuthenticated]);
  */
  /* ========================================================================= */

  const logActivity = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      activity: [{ id: `act-${Date.now()}`, message, at: "Just now" }, ...prev.activity].slice(0, 20),
    }));
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const currentUser =
      state.users.find((u) => u.employeeId === state.currentEmployeeId) ??
      state.users[0] ??
      buildMockUsers()[0]!;
    
    // فحص دور الأدمن بدقة واحترافية
    const isAdmin = currentUser.role === "admin";

    return {
      ...state,
      currentUser,
      isAdmin,
      hydrated,
      can: (key) => {
        if (isAdmin) return true;
        return currentUser.permissions?.[key] === true;
      },
      findUserByEmail: (email) =>
        state.users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()),

      login: (userData: any) => {
        setState((prev) => {
          const email = typeof userData === "string" ? userData : userData.email;
          const foundUser = prev.users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
          
          let employeeId: number;
          let updatedUsers = [...prev.users];

          if (foundUser) {
            employeeId = foundUser.employeeId;
          } else {
            // لو يوزر جديد تماماً
            employeeId = Date.now();
            const newUser: AppUser = {
              employeeId,
              fullName: userData.fullName || email.split("@")[0],
              email: email,
              role: userData.role || "user",
              department: userData.department || "General",
              jobTitle: userData.jobTitle || "Employee",
              permissions: userData.permissions || defaultUserPermissions(),
            };
            updatedUsers.push(newUser);
          }

          return {
            ...prev,
            users: updatedUsers,
            currentEmployeeId: employeeId,
            isAuthenticated: true,
          };
        });
      },

      logout: () => {
        localStorage.removeItem("token");
        setState((prev) => ({ ...prev, isAuthenticated: false }));
      },

      addAsset: async (asset) => {
        /* 🚨🚨🚨 BACKEND TEAM: REAL API 🚨🚨🚨 */
        /*
        try {
          const res = await fetch("https://api.yourdomain.com/api/assets", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(asset)
          });
          const createdAsset = await res.json();
          setState((prev) => ({ ...prev, assets: [createdAsset, ...prev.assets] }));
          logActivity(`Asset "${createdAsset.name}" was added`);
          return;
        } catch (error) {
          console.error(error);
          throw error;
        }
        */

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

      updateAsset: async (asset) => {
        /* 🚨🚨🚨 BACKEND TEAM: REAL API 🚨🚨🚨 */
        /*
        await fetch(`https://api.yourdomain.com/api/assets/${asset.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify(asset)
        });
        */
        setState((prev) => ({
          ...prev,
          assets: prev.assets.map((a) => (a.id === asset.id ? asset : a)),
        }));
        logActivity(`Asset ${asset.id} was updated`);
      },

      deleteAsset: async (id) => {
        /* 🚨🚨🚨 BACKEND TEAM: REAL API 🚨🚨🚨 */
        /*
        await fetch(`https://api.yourdomain.com/api/assets/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        */
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
                  disposalDate: new Date().toISOString().script ? new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                }
              : a,
          ),
        }));
        logActivity(`Asset ${asset.id} was disposed / scrapped`);
      },

      resetData: () => {
        window.localStorage.removeItem(STORAGE_KEY);
        setState(initialState());
      },
    };
  }, [state, hydrated, logActivity]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}