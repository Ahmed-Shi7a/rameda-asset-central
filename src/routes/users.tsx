import { createFileRoute } from "@tanstack/react-router";
import { Search, UserPlus, Pencil, Trash2, ShieldCheck, User, Users, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { NoAccess, StatusBadge } from "@/components/shared";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/lib/app-context";
import {
  PERMISSION_GROUPS,
  defaultUserPermissions,
  type AppUser,
  type Permissions,
} from "@/lib/types";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & Permissions — RAMEDA Asset Central" },
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
  const { users, currentUser, isAdmin, can, addUser, updateUser, setUserPermissions, deleteUser } = useApp() as any;
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
        (!q || String(u.employeeId).includes(q) || u.fullName.toLowerCase().includes(q)) &&
        (statusFilter === "all" || u.status === statusFilter),
    );
  }, [users, query, statusFilter]);

  if (!canViewUsers) {
    return (
      <AppLayout title="Users">
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
    toast.success("User created successfully");
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

    toast.success("User profile updated successfully");
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
    toast.success(`User ${deletingUser.fullName} removed successfully`);
    setDeletingUser(null);
  }

  return (
    <AppLayout
      title="Users & Permissions"
      description="Create employee accounts, manage identity IDs, and configure granular module permissions."
      actions={
        canAddUser ? (
          <Button onClick={() => setAddOpen(true)} className="shadow-sm">
            <UserPlus className="size-4 mr-2" /> Add User
          </Button>
        ) : null
      }
    >
      {/* Search & Filter Bar */}
      <Card className="shadow-sm border-border/60 mb-6 bg-card">
        <CardContent className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 bg-background/50 focus-visible:bg-background transition-colors"
              placeholder="Search by Employee ID or Name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background/50">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[130px]">Employee ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u: AppUser) => (
                <TableRow key={u.employeeId} className="hover:bg-muted/40 transition-colors group">
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                    #{u.employeeId}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{u.fullName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                        <ShieldCheck className="size-3.5" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                        <User className="size-3.5" />
                        User
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    {isAdmin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium shadow-sm hover:bg-primary hover:text-primary-foreground"
                        onClick={() => openUser(u)}
                      >
                        Checklist
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">Admin Only</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => startEditUser(u)}
                          title="Edit user details"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteUser && u.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingUser(u)}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 text-muted-foreground/40" />
                      <p>No users found matching the filter criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New User</DialogTitle>
            <DialogDescription>
              Create employee profile with direct ID allocation and standard access.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Employee ID</Label>
              <Input
                inputMode="numeric"
                placeholder="e.g. 1007"
                value={newUser.employeeId}
                onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</Label>
              <Input
                placeholder="e.g. Mohamed Ali"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</Label>
              <Input
                type="email"
                placeholder="user@rameda.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</Label>
              <Input
                placeholder="+20 1X XXXX XXXX"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit User Profile</DialogTitle>
            <DialogDescription>
              Update employee identity ID, contact info, and status.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Employee ID</Label>
                <Input
                  inputMode="numeric"
                  value={editingUser.employeeId}
                  onChange={(e) => setEditingUser({ ...editingUser, employeeId: e.target.value as any })}
                  className="font-mono font-medium focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Account Status</Label>
                <Select
                  value={editingUser.status}
                  onValueChange={(v: "Active" | "Inactive") => setEditingUser({ ...editingUser, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</Label>
                <Input
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</Label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</Label>
                <Input
                  value={editingUser.phone || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUserEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingUser} onOpenChange={(o) => !o && setDeletingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive text-xl flex items-center gap-2">
              <Trash2 className="size-5" />
              Delete User
            </DialogTitle>
            <DialogDescription className="pt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-foreground">{deletingUser?.fullName}</strong> (ID: #{deletingUser?.employeeId})?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Checklist Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-6">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  Permission Checklist
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Configuring permissions for <strong className="text-foreground">{selected?.fullName}</strong> (Employee #{selected?.employeeId})
                </DialogDescription>
              </div>
              {selected?.role === "admin" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                  <CheckCircle2 className="size-3.5" /> Full Admin Access
                </span>
              )}
            </div>
          </DialogHeader>

          {selected && (
            <div className="py-4 overflow-y-auto pr-1">
              <div className="grid gap-4 sm:grid-cols-2">
                {PERMISSION_GROUPS.map((group, idx) => (
                  <div
                    key={group.group}
                    className={`rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:border-primary/40 ${
                      idx === PERMISSION_GROUPS.length - 1 && PERMISSION_GROUPS.length % 2 !== 0
                        ? "sm:col-span-2 bg-muted/20 border-dashed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-border/40">
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        {group.group}
                      </p>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {group.items.filter((i) => selected.role === "admin" || draftPerms[i.key]).length}/{group.items.length} Enabled
                      </span>
                    </div>

                    <div className={`space-y-2.5 ${
                      idx === PERMISSION_GROUPS.length - 1 && PERMISSION_GROUPS.length % 2 !== 0
                        ? "grid sm:grid-cols-2 gap-x-6 gap-y-2.5 space-y-0"
                        : ""
                    }`}>
                      {group.items.map((item) => (
                        <label
                          key={item.key}
                          className="flex items-start gap-3 text-sm cursor-pointer rounded-lg p-1.5 -m-1.5 hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            className="mt-0.5 data-[state=checked]:bg-primary"
                            checked={
                              selected.role === "admin" ? true : draftPerms[item.key] === true
                            }
                            disabled={selected.role === "admin" || !isAdmin}
                            onCheckedChange={(checked) =>
                              setDraftPerms((prev) => ({ ...prev, [item.key]: checked === true }))
                            }
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground/90 text-xs sm:text-sm">
                              {item.label}
                            </span>
                            {item.key.endsWith(".delete") && (
                              <span className="text-[10px] text-rose-500 font-semibold mt-0.5">
                                RESTRICTED ACTION
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-between sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              disabled={selected?.role === "admin" || !isAdmin}
              onClick={() => {
                if (selected) setUserPermissions(selected.employeeId, draftPerms);
                setSelected(null);
                toast.success("Permissions updated successfully");
              }}
            >
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}