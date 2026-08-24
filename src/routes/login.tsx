import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowRight, ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — RAMEDA Pharmaceuticals" },
      { name: "description", content: "RAMEDA Asset Management System" },
    ],
  }),
  component: LoginPage,
});

/**
 * RAMEDA 4-Square Emblem
 */
function RamedaLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M15 15H42V42H15V15Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M58 15H85V42H58V15Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 58H42V85H15V58Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M58 58H85V85H58V58Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </svg>
  );
}

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      toast.success(`Verification code sent to ${cleanEmail}`);
    }, 400);
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    // Default mock verification code
    if (otp.trim() !== "123456") {
      toast.error("Invalid verification code. (Default is 123456)");
      return;
    }

    setLoading(true);
    try {
      const success = await login(email.trim().toLowerCase());
      if (success) {
        toast.success("Signed in successfully");
        navigate({ to: "/" });
      } else {
        toast.error("Account not found. Please check your email address.");
      }
    } catch {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setOtp("123456");
    setStep("otp");
    toast.info("Demo credentials applied. Click verify to continue.");
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Left Column: RAMEDA Brand & Waves */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between overflow-hidden p-12 lg:p-16 border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#071626] to-[#041d1a]">
        
        {/* Subtle Fluid Waves */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 220 C 150 120, 350 460, 850 260" stroke="#10b981" strokeWidth="2" strokeOpacity="0.7" />
            <path d="M-100 270 C 170 170, 370 490, 850 310" stroke="#06b6d4" strokeWidth="2.5" strokeOpacity="0.8" />
            <path d="M-100 320 C 190 220, 390 520, 850 360" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.8" />
            <path d="M-100 370 C 220 270, 420 550, 850 410" stroke="#059669" strokeWidth="1.5" strokeOpacity="0.6" />
          </svg>
        </div>

        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px]" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 text-white shadow-lg shadow-emerald-500/15">
            <RamedaLogo className="size-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black lowercase tracking-tight text-white">rameda</span>
            <p className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">Pharmaceuticals</p>
          </div>
        </div>

        {/* Core Presentation */}
        <div className="relative z-10 my-auto max-w-md space-y-4 py-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            Asset Management &amp; Barcode System
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Centralized platform for tracking hardware inventory, maintenance operations, and standard RAMEDA thermal label printing across HQ and regional scientific offices.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/60 pt-6 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} RAMEDA Pharmaceuticals</span>
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Enterprise Security</span>
          </div>
        </div>
      </div>

      {/* Right Column: Clean OTP / Sign In Form */}
      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:w-5/12 text-slate-900">
        <div className="mx-auto w-full max-w-sm space-y-7">
          
          {/* Mobile Brand Header */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 text-white">
              <RamedaLogo className="size-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black lowercase text-slate-900">rameda</span>
              <p className="text-xs text-slate-500 font-medium">Asset Management</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {step === "email" ? "Sign In" : "Verification Code"}
            </h2>
            <p className="text-xs text-slate-500">
              {step === "email"
                ? "Enter your corporate email to receive an authentication code."
                : `Enter the 6-digit verification code sent to ${email}`}
            </p>
          </div>

          {/* Step 1: Email Form */}
          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="name@rameda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 text-sm bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 transition-all rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-600/20 gap-2 transition-all"
              >
                {loading ? "Sending..." : (
                  <>
                    Send Code <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Step 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">6-Digit Code</label>
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline"
                  >
                    <ArrowLeft className="size-3" /> Change email
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 h-11 text-center font-mono text-base tracking-widest bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 transition-all rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-600/20 gap-2 transition-all"
              >
                {loading ? "Verifying..." : (
                  <>
                    Verify &amp; Sign In <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Demo Fast Access */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Quick Access (Demo)
              </p>
              <span className="text-[10px] text-slate-400 font-mono">OTP: 123456</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("ahmed.emam@company.com")}
                className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50/30 group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Administrator</span>
                <span className="text-[10px] text-slate-500 truncate w-full">ahmed.emam@...</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("sarah.it@company.com")}
                className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2 text-left transition-all hover:border-blue-500 hover:bg-blue-50/30 group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Standard User</span>
                <span className="text-[10px] text-slate-500 truncate w-full">sarah.it@...</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}