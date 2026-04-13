import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { login, verifySession } from "@/lib/api";
import { Sparkles, Lock, ArrowRight, AlertCircle } from "lucide-react";
import SiteNav from "@/components/SiteNav";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    verifySession().then((valid) => {
      if (valid) setLocation("/x247-control-panel");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(username, password);
    if (ok) {
      setLocation("/x247-control-panel");
    } else {
      setError("Invalid credentials");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <SiteNav activePage="home" />
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl tracking-wide text-white font-normal">X247</span>
          </div>
          <h1 className="text-2xl font-display font-light text-white mb-2">Admin Access</h1>
          <p className="text-white/40 text-sm font-light">Restricted area. Authorized personnel only.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
          <div className="card-top-accent card-top-accent-navy" />
          <div className="card-shine" />
          <div className="relative z-[2] space-y-5">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {loading ? "Authenticating..." : "Login"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
