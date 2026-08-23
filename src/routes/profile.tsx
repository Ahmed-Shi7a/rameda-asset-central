import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-context";
import { PERMISSION_GROUPS } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — AssetFlow" },
      {
        name: "description",
        content: "View your employee details, role and granted permissions.",
      },
      { property: "og:title", content: "My Profile — AssetFlow" },
      {
        property: "og:description",
        content: "Employee details, role and granted permissions summary.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentUser, updateUser } = useApp();
  const [form, setForm] = useState({
    fullName: currentUser.fullName,
    email: currentUser.email,
    phone: currentUser.phone,
  });

  return (
    <AppLayout title="My Profile" description="Your account details and granted permissions.">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input value={currentUser.employeeId} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={currentUser.role === "admin" ? "Admin (Manager)" : "User"}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                onClick={() => {
                  updateUser({ ...currentUser, ...form });
                  toast.success("Profile updated");
                }}
              >
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <StatusBadge status={currentUser.status} />
              <p className="text-muted-foreground">
                Signed in as {currentUser.fullName} (#{currentUser.employeeId})
              </p>
            </CardContent>
          </Card>

        </div>

        <Card className="shadow-card lg:col-span-3">
          <CardHeader>
            <CardTitle>My granted permissions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.group}>
                <p className="mb-2 text-sm font-semibold">{group.group}</p>
                <ul className="space-y-1.5 text-sm">
                  {group.items.map((item) => {
                    const granted =
                      currentUser.role === "admin" || currentUser.permissions[item.key];
                    return (
                      <li key={item.key} className="flex items-center gap-2">
                        <span
                          className={
                            granted
                              ? "size-2 rounded-full bg-success"
                              : "size-2 rounded-full bg-muted-foreground/40"
                          }
                        />
                        <span className={granted ? "" : "text-muted-foreground line-through"}>
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}