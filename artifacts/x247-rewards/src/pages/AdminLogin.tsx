import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { login, verifySession } from "@/lib/api";
import { Sparkles, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const HCAPTCHA_SITE_KEY = "57c8688a-ca78-46a2-843e-8d1c3fdae89a";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    verifySession().then((valid) => {
      if (valid) setLocation("/x247-control-panel");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captchaToken) {
      setError("Please complete the security check.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await login(username, password);
    if (ok) {
      setLocation("/x247-control-panel");
    } else {
      setError("Invalid credentials. Please try again.");
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl tracking-wide text-white font-normal">X247</span>
          </div>
          <h1 className="text-3xl font-display font-light text-white mb-2">Admin Access</h1>
          <p className="text-white/35 text-sm font-light">Restricted area. Authorized personnel only.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
          <div className="card-top-accent card-top-accent-navy" />
          <div className="card-shine" />
          <div className="relative z-[2] space-y-5">

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-light">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                Security Verification
              </label>
              <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITE_KEY}
                  theme="dark"
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </div>
              {!captchaToken && (
                <p className="text-[10px] text-white/25 mt-1.5 font-light">Complete the captcha above to enable login.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              {loading ? "Authenticating..." : "Login to Dashboard"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

        <p className="text-center text-[10px] text-white/20 mt-6 font-light">
          Unauthorized access attempts are monitored and logged.
        </p>
      </div>
    </div>
  );
}
