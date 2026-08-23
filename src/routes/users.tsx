import { createFileRoute } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";
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
      { title: "Users & Permissions — AssetFlow" },
      {
        name: "description",
        content:
          "Admin console to create employees and assign granular module permissions per user.",
      },
      { property: "og:title", content: "Users & Permissions — AssetFlow" },
      {
        property: "og:description",
        content: "Create accounts and control access with a permission checklist.",
      },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { users, isAdmin, addUser, updateUser, setUserPermissions } = useApp();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [draftPerms, setDraftPerms] = useState<Permissions>(defaultUserPermissions());
  const [newUser, setNewUser] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!q || String(u.employeeId).includes(q)) &&
        (statusFilter === "all" || u.status === statusFilter),
    );
  }, [users, query, statusFilter]);

  if (!isAdmin) {
    return (
      <AppLayout title="Users">
        <NoAccess feature="manage users" />
      </AppLayout>
    );
  }

  function openUser(user: AppUser) {
    setSelected(user);
    setDraftPerms({ ...user.permissions });
  }

  function createUser() {
    const id = Number(newUser.employeeId);
    if (!Number.isInteger(id) || id <= 0) {
      toast.error("Employee ID must be a positive integer.");
      return;
    }
    if (users.some((u) => u.employeeId === id)) {
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
    toast.success("User created");
  }

  return (
    <AppLayout
      title="Users & Permissions"
      description="Create employee accounts and control what each user can do."
      actions={
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="size-4" /> Add User
        </Button>
      }
    >
      <Card className="shadow-card mb-6">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by Employee ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Full name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow
                  key={u.employeeId}
                  className="cursor-pointer"
                  onClick={() => openUser(u)}
                >
                  <TableCell className="font-mono text-xs">{u.employeeId}</TableCell>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{u.role === "admin" ? "Admin (Manager)" : "User"}</TableCell>
                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUser(u);
                      }}
                    >
                      Checklist
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No users match this search.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              New users start with view-only access; open their checklist to grant more.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input
                inputMode="numeric"
                value={newUser.employeeId}
                onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone number</Label>
              <Input
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createUser}>Create user</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Permission checklist — {selected?.fullName}</DialogTitle>
            <DialogDescription>
              Employee #{selected?.employeeId} ·{" "}
              {selected?.role === "admin"
                ? "Admins always have full access."
                : "Tick the features this user can access."}
            </DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Label className="text-sm">Account status</Label>
                <Select
                  value={selected.status}
                  onValueChange={(v) => {
                    const next = { ...selected, status: v as AppUser["status"] };
                    setSelected(next);
                    updateUser(next);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.group} className="rounded-xl border border-border p-4">
                    <p className="mb-3 text-sm font-semibold">{group.group}</p>
                    <div className="space-y-2.5">
                      {group.items.map((item) => (
                        <label key={item.key} className="flex items-center gap-3 text-sm">
                          <Checkbox
                            checked={
                              selected.role === "admin" ? true : draftPerms[item.key] === true
                            }
                            disabled={selected.role === "admin"}
                            onCheckedChange={(checked) =>
                              setDraftPerms((prev) => ({ ...prev, [item.key]: checked === true }))
                            }
                          />
                          {item.label}
                          {item.key.endsWith(".delete") ? (
                            <span className="text-xs text-muted-foreground">(restricted)</span>
                          ) : null}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button
              disabled={selected?.role === "admin"}
              onClick={() => {
                if (selected) setUserPermissions(selected.employeeId, draftPerms);
                setSelected(null);
                toast.success("Permissions saved");
              }}
            >
              Save permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}