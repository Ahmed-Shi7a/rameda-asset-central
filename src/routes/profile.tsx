import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  IdCard, 
  Lock, 
  Save,
  KeyRound
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-context";
import { PERMISSION_GROUPS } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — RAMEDA Central" },
      {
        name: "description",
        content: "View your employee details, role and granted permissions.",
      },
      { property: "og:title", content: "My Profile — RAMEDA Central" },
      {
        property: "og:description",
        content: "Employee details, role and granted permissions summary.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentUser, updateUser } = useApp() as any;
  const [form, setForm] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  });

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleSave = () => {
    if (!form.fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (typeof updateUser === "function") {
      updateUser({ ...currentUser, ...form });
      toast.success("Profile details updated successfully.");
    }
  };

  return (
    <AppLayout
      title="My Profile"
      description="Manage your personal account credentials and review system access permissions."
    >
      <div className="space-y-6">
        
        {/* 1. Profile Identity Top Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative grid size-16 place-items-center rounded-2xl bg-teal-600 text-white font-bold text-xl shadow-md shadow-teal-600/20 shrink-0">
                {getInitials(currentUser?.fullName || "Ahmed Emam")}
                <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>

              {/* User Bio */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{currentUser?.fullName || "Ahmed Emam"}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    <ShieldCheck className="size-3" />
                    {currentUser?.role === "admin" ? "System Administrator" : "Standard User"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>ID: <strong className="font-mono text-foreground">{currentUser?.employeeId || "1000"}</strong></span>
                  <span>&bull;</span>
                  <span>{currentUser?.email || "ahmed.emam@company.com"}</span>
                </p>
              </div>
            </div>

            {/* Account Status Tag */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-500" />
                Active Account
              </span>
            </div>
          </div>
        </div>

        {/* 2. Main Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Form Card (8 Columns) */}
          <Card className="lg:col-span-8 border-border/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4.5 text-teal-600" /> Personal &amp; Contact Details
              </CardTitle>
              <CardDescription className="text-xs">
                Update your contact details and display information.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* Employee ID (Read-only) */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Employee ID</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-normal">
                      <Lock className="size-2.5" /> Read-only
                    </span>
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                    <Input 
                      value={currentUser?.employeeId || "1000"} 
                      readOnly 
                      className="pl-9 h-10 bg-muted/40 text-muted-foreground font-mono text-xs border-border/60 cursor-not-allowed" 
                    />
                  </div>
                </div>

                {/* Role (Read-only) */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>System Role</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-normal">
                      <Lock className="size-2.5" /> Read-only
                    </span>
                  </Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                    <Input
                      value={currentUser?.role === "admin" ? "Admin (Manager)" : "Standard User"}
                      readOnly
                      className="pl-9 h-10 bg-muted/40 text-muted-foreground text-xs border-border/60 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="pl-9 h-10 bg-muted/20 border-border/80 focus-visible:ring-teal-500 text-xs"
                      placeholder="e.g. Ahmed Emam"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Corporate Email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="pl-9 h-10 bg-muted/20 border-border/80 focus-visible:ring-teal-500 text-xs"
                      placeholder="e.g. ahmed.emam@company.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="pl-9 h-10 bg-muted/20 border-border/80 focus-visible:ring-teal-500 text-xs"
                      placeholder="e.g. +20 100 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-3 flex justify-end">
                <Button
                  onClick={handleSave}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium gap-2 shadow-sm shadow-teal-600/20 transition-all hover:scale-[1.01]"
                >
                  <Save className="size-4" /> Save Profile Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Security Card (4 Columns) */}
          <Card className="lg:col-span-4 border-border/80 shadow-sm flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base flex items-center gap-2">
                  <KeyRound className="size-4.5 text-teal-600" /> Account Overview
                </CardTitle>
                <CardDescription className="text-xs">
                  Session &amp; access status.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2">
                  <p className="font-semibold text-foreground">Session Privileges</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Signed in as <strong className="text-foreground">{currentUser?.fullName}</strong> with authenticated privileges.
                  </p>
                </div>

                <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.04] p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold">
                    <ShieldCheck className="size-4" /> RAMEDA Central
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-normal mt-1">
                    Permissions and organizational roles are managed via the System Administrator.
                  </p>
                </div>
              </CardContent>
            </div>

            <div className="p-4 border-t border-border/50 text-[11px] text-muted-foreground text-center">
              Employee ID #{currentUser?.employeeId || "1000"}
            </div>
          </Card>
        </div>

        {/* 3. Granted Permissions Card */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="size-4.5 text-teal-600" /> Granted System Permissions
                </CardTitle>
                <CardDescription className="text-xs">
                  Privileges assigned to your account across inventory, maintenance, labels, and reports.
                </CardDescription>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 w-fit">
                {currentUser?.role === "admin" ? "Full Administrator Access" : "Custom User Privileges"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PERMISSION_GROUPS.map((group) => (
                <div 
                  key={group.group} 
                  className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground pb-1.5 border-b border-border/60">
                    {group.group}
                  </p>
                  
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const granted =
                        currentUser?.role === "admin" ||
                        (currentUser?.permissions && currentUser.permissions[item.key]);

                      return (
                        <div
                          key={item.key}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                            granted
                              ? "bg-card border border-border/60 text-foreground font-medium shadow-xs"
                              : "bg-muted/40 text-muted-foreground/50 border border-transparent"
                          }`}
                        >
                          <span className="truncate pr-2">{item.label}</span>
                          {granted ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              <CheckCircle2 className="size-3.5 text-emerald-500" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/60 shrink-0">
                              <XCircle className="size-3.5 text-muted-foreground/40" /> Locked
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}

export default ProfilePage;