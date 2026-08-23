import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-context";

/** Development fallback code — any registered email can sign in with this OTP. */
const MOCK_OTP = "123456";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AssetFlow" },
      {
        name: "description",
        content: "Passwordless sign in to AssetFlow with your work email and a 6-digit code.",
      },
      { property: "og:title", content: "Sign in — AssetFlow" },
      {
        property: "og:description",
        content: "Email + one-time code access to the asset management dashboard.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, findUserByEmail, login } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/", replace: true });
  }, [isAuthenticated, navigate]);

  function requestCode() {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (!findUserByEmail(value)) {
      toast.error("No account found for this email. Ask an administrator to create one.");
      return;
    }
    setStep("otp");
    toast.success(`Verification code sent to ${value} (use ${MOCK_OTP} in development).`);
  }

  function verify() {
    if (code.trim() !== MOCK_OTP) {
      toast.error("Invalid code. Please try again.");
      return;
    }
    if (!login(email)) {
      toast.error("No account found for this email.");
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sidebar to-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <p className="text-lg font-semibold">AssetFlow</p>
            <p className="text-xs text-muted-foreground">Asset Management System</p>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{step === "email" ? "Sign in" : "Enter your code"}</CardTitle>
            <CardDescription>
              {step === "email"
                ? "Passwordless access — we'll email you a 6-digit verification code."
                : `We sent a 6-digit code to ${email}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "email" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="pl-9"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && requestCode()}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={requestCode}>
                  Send verification code
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">6-digit code</Label>
                  <div className="relative">
                    <KeyRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="otp"
                      inputMode="numeric"
                      maxLength={6}
                      className="pl-9 tracking-[0.4em]"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && verify()}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={verify}>
                  Verify and continue
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                  }}
                >
                  <ArrowLeft className="size-4" /> Use a different email
                </Button>
              </>
            )}
            <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Development mode: any registered user email works with code{" "}
              <span className="font-mono font-semibold">{MOCK_OTP}</span> (e.g.
              ahmed.emam@company.com).
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
