import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { login } from "@/lib/api";
import { Lock, X, ArrowRight, AlertCircle, Shield } from "lucide-react";

interface AdminGateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminGateModal({ open, onClose }: AdminGateModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(username, password);
    if (ok) {
      onClose();
      setUsername("");
      setPassword("");
      setError("");
      setLocation("/x247-control-panel");
    } else {
      setError("Access denied");
    }
    setLoading(false);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
          <div className="card-shine" />
          <div className="relative z-[2]">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-1 text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white/50" />
              </div>
              <div>
                <h3 className="text-sm font-display font-light text-white">Admin Access</h3>
                <p className="text-[10px] text-white/30 font-light">Authorized personnel only</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs mb-4">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-display font-medium text-white/30 uppercase tracking-[0.15em] block mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/15 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="Enter username"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] font-display font-medium text-white/30 uppercase tracking-[0.15em] block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/15 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-xs font-display font-light hover:bg-white/[0.1] transition-all disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                {loading ? "Verifying..." : "Authenticate"}
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
