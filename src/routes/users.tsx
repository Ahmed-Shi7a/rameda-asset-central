import { createFileRoute } from "@tanstack/react-router";
import { 
  Search, 
  UserPlus, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  User, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  SlidersHorizontal,
  KeyRound,
  Check,
  RotateCcw
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { NoAccess } from "@/components/shared";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useApp } from "@/lib/app-context";
import {
  PERMISSION_GROUPS,
  defaultUserPermissions,
  type AppUser,
  type Permissions,
  type PermissionKey,
} from "@/lib/types";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & Permissions — RAMEDA Central" },
      {
        name: "description",
        content:
          "Admin console to create employees and assign granular module permissions per user.",
      },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { users = [], currentUser, isAdmin, can, addUser, updateUser, setUserPermissions, deleteUser } = useApp() as any;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [draftPerms, setDraftPerms] = useState<Permissions>(defaultUserPermissions());
  
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [originalEmployeeId, setOriginalEmployeeId] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);

  const [newUser, setNewUser] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const canViewUsers = isAdmin || (typeof can === "function" && can("users.view"));
  const canAddUser = isAdmin || (typeof can === "function" && can("users.create"));
  const canDeleteUser = isAdmin || (typeof can === "function" && can("users.delete"));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u: AppUser) =>
        (!q || String(u.employeeId).includes(q) || u.fullName?.toLowerCase().includes(q)) &&
        (statusFilter === "all" || u.status === statusFilter),
    );
  }, [users, query, statusFilter]);

  if (!canViewUsers) {
    return (
      <AppLayout title="Users & Permissions">
        <NoAccess feature="view or manage users" />
      </AppLayout>
    );
  }

  function openUser(user: AppUser) {
    setSelected(user);
    setDraftPerms({ ...user.permissions });
  }

  function startEditUser(user: AppUser) {
    setOriginalEmployeeId(user.employeeId);
    setEditingUser({ ...user });
  }

  function createUser() {
    const id = Number(newUser.employeeId);
    if (!Number.isInteger(id) || id <= 0) {
      toast.error("Employee ID must be a positive integer.");
      return;
    }
    if (users.some((u: AppUser) => u.employeeId === id)) {
      toast.error("That Employee ID already exists.");
      return;
    }
    if (!newUser.fullName.trim() || !newUser.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }
    addUser({
      employeeId: id,
      fullName: newUser.fullName.trim(),
      email: newUser.email.trim(),
      phone: newUser.phone.trim(),
      role: "user",
      status: "Active",
      permissions: defaultUserPermissions(),
    });
    setNewUser({ employeeId: "", fullName: "", email: "", phone: "" });
    setAddOpen(false);
    toast.success("User created successfully.");
  }

  function handleSaveUserEdit() {
    if (!editingUser) return;
    const newId = Number(editingUser.employeeId);
    if (!Number.isInteger(newId) || newId <= 0) {
      toast.error("Employee ID must be a valid positive integer.");
      return;
    }
    if (originalEmployeeId !== newId && users.some((u: AppUser) => u.employeeId === newId)) {
      toast.error("This Employee ID is already assigned to another user.");
      return;
    }
    if (!editingUser.fullName.trim() || !editingUser.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }

    if (originalEmployeeId !== newId && typeof deleteUser === "function") {
      deleteUser(originalEmployeeId);
      addUser({
        ...editingUser,
        employeeId: newId,
      });
    } else {
      updateUser(editingUser);
    }

    toast.success("User profile updated successfully.");
    setEditingUser(null);
    setOriginalEmployeeId(null);
  }

  function handleConfirmDelete() {
    if (!deletingUser) return;
    if (deletingUser.role === "admin" || (currentUser && currentUser.employeeId === deletingUser.employeeId)) {
      toast.error("You cannot delete the primary Admin account.");
      setDeletingUser(null);
      return;
    }
    if (typeof deleteUser === "function") {
      deleteUser(deletingUser.employeeId);
    } else {
      updateUser({ ...deletingUser, status: "Inactive" });
    }
    toast.success(`User ${deletingUser.fullName} removed successfully.`);
    setDeletingUser(null);
  }

  // ميزة تحديد أو إلغاء تحديد مجموعة كاملة
  function toggleGroupPermissions(groupItems: { key: PermissionKey }[]) {
    const allChecked = groupItems.every((item) => draftPerms[item.key] === true);
    setDraftPerms((prev) => {
      const next = { ...prev };
      groupItems.forEach((item) => {
        next[item.key] = !allChecked;
      });
      return next;
    });
  }

  return (
    <AppLayout
      title="Users & Permissions"
      description="Create employee accounts, manage identity IDs, and configure granular module permissions."
      actions={
        canAddUser ? (
          <Button 
            onClick={() => setAddOpen(true)} 
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium gap-1.5 shadow-sm shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="size-4" /> Add User
          </Button>
        ) : null
      }
    >
      <div className="space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-10 h-10 bg-muted/30 border-border/80 focus-visible:ring-teal-500 text-xs"
                placeholder="Search by Employee ID or Name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 bg-muted/30 border-border/80 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <th className="p-3.5 w-[120px]">Employee ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Corporate Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Permissions</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <SlidersHorizontal className="size-8 text-muted-foreground/40" />
                        <p className="text-sm font-semibold text-foreground">No users found</p>
                        <p className="text-xs">Try adjusting your search query or clear the filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((u: AppUser) => (
                    <tr key={u.employeeId} className="hover:bg-muted/30 transition-colors group">
                      
                      {/* Employee ID */}
                      <td className="p-3.5 font-bold font-mono text-teal-600 dark:text-teal-400">
                        #{u.employeeId}
                      </td>

                      {/* Full Name */}
                      <td className="p-3.5 font-semibold text-foreground">
                        {u.fullName}
                      </td>

                      {/* Email */}
                      <td className="p-3.5 text-muted-foreground">
                        {u.email}
                      </td>

                      {/* Role */}
                      <td className="p-3.5">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-bold text-teal-600 dark:text-teal-400 border border-teal-500/20">
                            <ShieldCheck className="size-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/70">
                            <User className="size-3" /> Standard
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <StatusBadge status={u.status === "Inactive" ? "Scrapped" : "Active"} />
                      </td>

                      {/* Permissions Checklist Button */}
                      <td className="p-3.5 text-center">
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => openUser(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 hover:bg-teal-600 hover:text-white transition-all duration-150 active:scale-95 shadow-xs"
                          >
                            <KeyRound className="size-3.5" /> Checklist
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60 font-mono">Admin Only</span>
                        )}
                      </td>

                      {/* Calm Action Buttons */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5 shadow-sm">
                          {isAdmin && (
                            <button
                              type="button"
                              title="Edit user details"
                              onClick={() => startEditUser(u)}
                              className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-teal-600 hover:bg-teal-500/10 dark:hover:text-teal-400 dark:hover:bg-teal-500/15 transition-colors"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                          )}

                          {canDeleteUser && u.role !== "admin" && (
                            <button
                              type="button"
                              title="Delete user"
                              onClick={() => setDeletingUser(u)}
                              className="size-7 rounded-md flex items-center justify-center text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add User Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg border-border/80 shadow-2xl">
          <DialogHeader className="pb-2 border-b border-border/60">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <UserPlus className="size-4.5 text-teal-600" /> Add New User
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create employee profile with direct ID allocation and standard access permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3.5 sm:grid-cols-2 py-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Employee ID *</Label>
              <Input
                inputMode="numeric"
                placeholder="e.g. 1007"
                value={newUser.employeeId}
                onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                className="font-mono text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
              <Input
                placeholder="e.g. Mohamed Ali"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                className="text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Corporate Email *</Label>
              <Input
                type="email"
                placeholder="user@rameda.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
              <Input
                placeholder="+20 1X XXXX XXXX"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="text-xs h-10"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end pt-3 border-t border-border/60">
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createUser}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="sm:max-w-lg border-border/80 shadow-2xl">
          <DialogHeader className="pb-2 border-b border-border/60">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Pencil className="size-4.5 text-teal-600" /> Edit User Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update employee identity ID, contact info, and status.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="grid gap-3.5 py-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Employee ID</Label>
                <Input
                  inputMode="numeric"
                  value={editingUser.employeeId}
                  onChange={(e) => setEditingUser({ ...editingUser, employeeId: e.target.value as any })}
                  className="font-mono text-xs h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Account Status</Label>
                <Select
                  value={editingUser.status}
                  onValueChange={(v: "Active" | "Inactive") => setEditingUser({ ...editingUser, status: v })}
                >
                  <SelectTrigger className="text-xs h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
                <Input
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="text-xs h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Corporate Email *</Label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="text-xs h-10"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <Input
                  value={editingUser.phone || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="text-xs h-10"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-end pt-3 border-t border-border/60">
            <Button variant="secondary" size="sm" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUserEdit}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingUser} onOpenChange={(o) => !o && setDeletingUser(null)}>
        <DialogContent className="sm:max-w-md border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-600 text-base font-bold flex items-center gap-2">
              <Trash2 className="size-5" /> Delete User Account
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Are you sure you want to permanently remove <strong className="text-foreground">{deletingUser?.fullName}</strong> (Employee ID: <span className="font-mono">#{deletingUser?.employeeId}</span>)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end pt-3 border-t border-border/60">
            <Button variant="secondary" size="sm" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modern Refactored Permissions Checklist Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-6 border-border/80 shadow-2xl">
          
          {/* Modal Header */}
          <DialogHeader className="pb-3 border-b border-border/60 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <ShieldCheck className="size-5 text-teal-600" /> Permission Checklist
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configuring granular privileges for <strong className="text-foreground">{selected?.fullName}</strong> (Employee <span className="font-mono font-semibold">#{selected?.employeeId}</span>)
                </DialogDescription>
              </div>

              {selected?.role === "admin" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-500/20 w-fit">
                  <CheckCircle2 className="size-3.5" /> Full Admin Access
                </span>
              )}
            </div>
          </DialogHeader>

          {/* Checklist Content Grid */}
          {selected && (
            <div className="py-4 overflow-y-auto pr-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {PERMISSION_GROUPS.map((group) => {
                  const activeCount = group.items.filter(
                    (i) => selected.role === "admin" || draftPerms[i.key] === true
                  ).length;
                  const allActive = activeCount === group.items.length;

                  return (
                    <div
                      key={group.group}
                      className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-teal-500/30 flex flex-col justify-between"
                    >
                      {/* Card Header with Group Name & Batch Toggle */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                            {group.group}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {activeCount} of {group.items.length} privileges active
                          </span>
                        </div>

                        {/* Quick Toggle All Button */}
                        {selected.role !== "admin" && isAdmin && (
                          <button
                            type="button"
                            onClick={() => toggleGroupPermissions(group.items)}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10 transition-colors"
                          >
                            {allActive ? "Clear All" : "Select All"}
                          </button>
                        )}
                      </div>

                      {/* Permission Items */}
                      <div className="space-y-2">
                        {group.items.map((item) => {
                          const isChecked = selected.role === "admin" ? true : draftPerms[item.key] === true;
                          const isRestricted = item.key.endsWith(".delete");

                          return (
                            <label
                              key={item.key}
                              className={`group flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer select-none ${
                                isChecked
                                  ? "border-teal-500/40 bg-teal-500/[0.04] text-foreground font-medium"
                                  : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:border-border"
                              } ${selected.role === "admin" || !isAdmin ? "cursor-not-allowed opacity-80" : ""}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <Checkbox
                                  className="size-4 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 shrink-0"
                                  checked={isChecked}
                                  disabled={selected.role === "admin" || !isAdmin}
                                  onCheckedChange={(checked) =>
                                    setDraftPerms((prev) => ({ ...prev, [item.key]: checked === true }))
                                  }
                                />
                                <span className="truncate">{item.label}</span>
                              </div>

                              {/* Badges */}
                              {isRestricted ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                                  Restricted
                                </span>
                              ) : isChecked ? (
                                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold shrink-0 flex items-center gap-0.5">
                                  <Check className="size-3" />
                                </span>
                              ) : null}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={selected?.role === "admin" || !isAdmin}
              onClick={() => {
                if (selected) setUserPermissions(selected.employeeId, draftPerms);
                setSelected(null);
                toast.success("Permissions updated successfully.");
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm"
            >
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}