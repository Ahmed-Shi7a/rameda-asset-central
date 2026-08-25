import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  KeyRound,
  Boxes,
  Lock,
  Printer,
  ChevronLeft
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign In — RAMEDA Asset Central" }],
  }),
  component: LoginPage,
});

// أيقونة تكنولوجية مذهلة (Tech Core / System Node) بديلة للوجو
function SystemIcon({ className = "size-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Outer Tech Frame */}
      <rect x="12" y="12" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="2.5" className="text-teal-500/40" />
      {/* Inner Core Border */}
      <rect x="22" y="22" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="4" className="text-teal-400" />
      {/* Center Energy Dot */}
      <circle cx="32" cy="32" r="4" fill="currentColor" className="text-teal-300" />
      {/* Connection Nodes */}
      <path d="M32 12 V22 M32 42 V52 M12 32 H22 M42 32 H52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-teal-300" />
      {/* Corner Accents */}
      <path d="M12 24 V12 H24 M40 12 H52 V24 M52 40 V52 H40 M24 52 H12 V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500/60" />
    </svg>
  );
}

function LoginPage() {
  const { login } = useApp() as any;
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleRequestOTP(selectedEmail?: string) {
    const targetEmail = (selectedEmail || email).trim();
    if (!targetEmail) {
      toast.error("Please enter your corporate email.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setEmail(targetEmail);
      setStep("otp");
      setLoading(false);
      toast.success("Authentication code sent!");
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }, 600);
  }

  function handleVerifyOTP(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (typeof login === "function") {
        login(email);
      }
      toast.success("Welcome back!");
      navigate({ to: "/" });
      setLoading(false);
    }, 400);
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      const newOtp = [...otp];
      for (let i = 0; i < pastedCode.length; i++) {
        if (i < 6) newOtp[i] = pastedCode[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(pastedCode.length, 5);
      otpRefs.current[nextFocus]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter" && otp.join("").length === 6) {
      handleVerifyOTP();
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background antialiased selection:bg-teal-500/20 font-sans">
      {/* Left Branding Side */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-b from-[#080E14] via-[#0D1822] to-[#070D12] p-8 lg:p-14 text-white border-r border-slate-800/60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute -left-24 -top-24 size-[420px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -right-24 bottom-12 size-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-lg shadow-teal-500/10 p-2.5 backdrop-blur-md">
            <SystemIcon className="size-9 text-teal-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[26px] font-bold tracking-tight text-white leading-none lowercase">rameda</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400 mt-1.5 opacity-90">
              Asset Central
            </span>
          </div>
        </div>

        {/* Center Content Section */}
        <div className="relative z-10 max-w-xl my-auto py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3.5 py-1 text-xs font-medium text-teal-300 mb-6 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-teal-400" />
            <span>IT Asset Management &amp; Barcode System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-white leading-[1.2]">
            Smart Infrastructure &amp; Asset Tracking
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg">
            A unified management console for monitoring company hardware, maintenance cycles, and regional branch assets.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm transition-colors hover:bg-white/[0.05]">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                <Boxes className="size-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200 text-sm">Real-Time Inventory &amp; Stock</p>
                <p className="text-slate-400 mt-0.5">Live visibility over HQ and all regional scientific offices.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm transition-colors hover:bg-white/[0.05]">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                <Lock className="size-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200 text-sm">Granular Role-Based Access</p>
                <p className="text-slate-400 mt-0.5">Role security with custom feature permissions per employee.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm transition-colors hover:bg-white/[0.05]">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                <Printer className="size-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200 text-sm">Standard Barcode Generation</p>
                <p className="text-slate-400 mt-0.5">Direct thermal printing support for hardware labeling.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-500">
          <p>© 2026 RAMEDA Pharmaceuticals. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <ShieldCheck className="size-4 text-teal-400" />
            <span>Enterprise Security</span>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50/50 dark:bg-card">
        <div className="w-full max-w-[380px]">
          
          {step === "email" ? (
            // ================== STEP 1: EMAIL ENTRY ==================
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-7">
              <div className="space-y-2 text-left">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Sign In</h2>
                <p className="text-[15px] text-muted-foreground">
                  Enter your corporate email address to access your workspace.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleRequestOTP(); }} className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Corporate Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@rameda.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-11 bg-background text-[15px] shadow-sm focus-visible:ring-teal-500 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md shadow-teal-600/20 text-[15px] gap-2 transition-all"
                >
                  {loading ? "Verifying..." : "Send Code"}
                  {!loading && <ArrowRight className="size-4" />}
                </Button>
              </form>

              {/* Quick Access Card */}
              <Card className="border-border/70 bg-card shadow-sm rounded-xl">
                <CardContent className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5 tracking-wider uppercase">
                      <KeyRound className="size-3.5 text-teal-500" /> Quick Access (Demo)
                    </span>
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">Auto-fills OTP</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleRequestOTP("ahmed.emam@company.com")}
                      className="flex flex-col items-start p-3 rounded-lg border border-border/80 bg-background hover:border-teal-500/50 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-all text-left group"
                    >
                      <span className="text-xs font-bold text-foreground group-hover:text-teal-600 transition-colors">
                        Administrator
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate w-full mt-1">
                        ahmed.emam@company.com
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestOTP("sara.adel@company.com")}
                      className="flex flex-col items-start p-3 rounded-lg border border-border/80 bg-background hover:border-teal-500/50 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-all text-left group"
                    >
                      <span className="text-xs font-bold text-foreground group-hover:text-teal-600 transition-colors">
                        Standard User
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate w-full mt-1">
                        sara.adel@company.com
                      </span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // ================== STEP 2: OTP ENTRY ==================
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
              {/* Back Button */}
              <div>
                <button 
                  onClick={() => setStep("email")}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors bg-muted/40 hover:bg-muted px-3 py-1.5 rounded-lg border border-border/50"
                >
                  <ChevronLeft className="size-4" /> Back to email
                </button>
              </div>

              {/* Title & Email */}
              <div className="space-y-3 text-left">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Verify identity</h2>
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  We've sent a 6-digit secure code to <br/>
                  <span className="text-foreground font-semibold inline-block mt-1">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-7">
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Authentication Code
                  </Label>
                  <div className="flex items-center justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <Input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        onChange={(e) => handleOtpChange(idx, e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="h-12 w-12 sm:h-14 sm:w-14 text-center text-xl font-bold rounded-xl border-border/80 shadow-sm focus-visible:ring-teal-500 focus-visible:border-teal-500 bg-background transition-all"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md shadow-teal-600/20 text-[15px] transition-all"
                >
                  {loading ? "Authenticating..." : "Verify & Sign In"}
                </Button>

                <div className="text-center mt-6">
                  <p className="text-[13px] font-medium text-muted-foreground">
                    Didn't receive a code?{" "}
                    <button type="button" className="font-bold text-teal-600 hover:text-teal-700 transition-colors ml-1">
                      Click to resend
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}