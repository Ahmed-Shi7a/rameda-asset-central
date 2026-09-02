import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { 
  ArrowRight, 
  KeyRound, 
  Mail, 
  ChevronLeft,
  Loader2,
  Sparkles
} from "lucide-react";

import brandFan from "@/assets/brand-fan.jpg";
import logoAsset from "@/assets/rameda-logo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In | Rameda Asset Central" },
      { name: "description", content: "Corporate sign-in for Rameda's IT asset management and barcode system." },
    ],
    links: [
      { rel: "icon", type: "image/png", href: logoAsset }
    ]
  }),
  component: LoginPage,
});

const demoAccounts = [
  { role: "Administrator", email: "ahmed.emam@company.com" },
  { role: "Standard User", email: "sara.adel@company.com" },
];

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
    <main className="relative min-h-screen w-full flex overflow-hidden font-sans bg-white selection:bg-[#0d9488]/20 selection:text-[#0d9488]">
      
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={brandFan} 
          alt="" 
          className="w-full h-full object-cover opacity-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 from-30% via-white/70 via-60% to-transparent to-100%" />
      </div>

      {/* ================= LAYOUT ================= */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row min-h-screen max-w-[1500px] mx-auto">
        
        {/* --- LEFT SECTION --- */}
        <section className="flex-1 flex flex-col justify-between px-8 py-12 lg:px-20 lg:py-16 h-screen relative z-10">
          
          {/* Top Group: Logo */}
          <div className="shrink-0">
            <div className="flex items-center gap-3.5">
              <img
                src={logoAsset}
                alt="RAMEDA"
                className="h-11 w-auto object-contain drop-shadow-sm"
              />
              <div className="flex flex-col justify-center">
                <span className="text-xl font-bold tracking-tight text-slate-900 uppercase leading-none">
                  rameda
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#0d9488] uppercase mt-1">
                  Asset Central
                </span>
              </div>
            </div>
          </div>

          {/* Middle Group: Badge (منتصف تماماً بالمسطرة بين اللوجو والعنوان) */}
          <div className="my-auto py-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0d9488]/20 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#0f766e] shadow-sm mb-6">
              <Sparkles className="size-3.5" />
              Enterprise Workspace
            </div>

            {/* Hero Content */}
            <div className="w-full max-w-[540px]">
              <h1 className="text-[2.5rem] lg:text-[52px] font-extrabold tracking-[-0.035em] text-slate-900 leading-[1.02]">
                Every asset
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d9488] to-[#2dd4bf]">
                  One clear view
                </span>
              </h1>

              <p className="mt-6 text-base lg:text-[17px] text-slate-600 font-medium leading-[1.6] max-w-[440px]">
                Manage your company's hardware with total clarity. 
                From instant inventory tracking to intelligent barcode 
                logistics.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              © 2026 RAMEDA Pharmaceuticals
            </p>
          </div>
        </section>

        {/* --- RIGHT SECTION: UNTOUCHED LOGIN CARD --- */}
        <section className="w-full lg:w-[50%] flex items-center justify-center p-6 lg:p-12 h-screen overflow-y-auto">
          
          <div className="w-full max-w-[480px] bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-12 shadow-[0_24px_60px_-12px_rgba(13,148,136,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/80 relative overflow-hidden">
            
            {step === "email" ? (
              <div className="animate-in fade-in duration-700 relative z-10">
                <h2 className="text-[1.75rem] font-bold tracking-tight text-slate-900 mb-2">
                  Welcome back
                </h2>
                <p className="text-sm text-slate-500 font-medium mb-8">
                  Sign in with your Rameda corporate email.
                </p>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleRequestOTP(); }}>
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                      Corporate Email
                    </Label>
                    <div className="relative group">
                      <Mail className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0d9488] transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@rameda.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 rounded-2xl bg-white/90 backdrop-blur-sm border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:bg-white focus:ring-[3px] focus:ring-[#0d9488]/20 focus:border-[#0d9488] font-semibold pl-12 text-slate-900 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="group h-14 w-full rounded-2xl text-sm font-bold bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-[0_8px_20px_-6px_rgba(13,148,136,0.5)] border-0 transition-all active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : "Request Secure Code"}
                    {!loading && <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-200/50">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">
                    <KeyRound className="size-3.5 text-[#0d9488]" />
                    Quick Access
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {demoAccounts.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => handleRequestOTP(account.email)}
                        className="group flex flex-col text-left rounded-2xl bg-white/60 backdrop-blur-sm border border-white p-4 hover:bg-white hover:shadow-[0_4px_12px_rgba(13,148,136,0.08)] transition-all duration-300"
                      >
                        <span className="block text-xs font-bold text-slate-800 group-hover:text-[#0d9488] transition-colors">
                          {account.role}
                        </span>
                        <span className="block w-full truncate text-[10px] text-slate-500 font-medium mt-1">
                          {account.email}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 relative z-10">
                <button 
                  onClick={() => setStep("email")}
                  className="mb-8 inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest"
                >
                  <ChevronLeft className="size-3.5" /> Back to Email
                </button>
                
                <h2 className="text-[1.75rem] font-bold tracking-tight text-slate-900 mb-2">
                  Verify identity
                </h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
                  We've sent a 6-digit secure code to <br/>
                  <span className="text-[#0d9488] font-bold inline-block mt-0.5">{email}</span>
                </p>

                <form onSubmit={handleVerifyOTP} className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
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
                          className="h-14 w-12 sm:h-16 sm:w-14 text-center text-2xl font-black rounded-2xl bg-white/90 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-white focus:bg-white focus:border-[#0d9488] focus:ring-[3px] focus:ring-[#0d9488]/20 transition-all duration-300"
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.join("").length < 6}
                    className="h-14 w-full rounded-2xl text-sm font-bold bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-[0_8px_20px_-6px_rgba(13,148,136,0.5)] border-0 transition-all active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : "Verify & Sign In"}
                  </Button>

                  <p className="text-center text-xs font-medium text-slate-500 pt-2">
                    Didn't receive it?{" "}
                    <button type="button" className="font-bold text-[#0d9488] hover:text-[#0f766e] transition-colors hover:underline underline-offset-4">
                      Resend code
                    </button>
                  </p>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}