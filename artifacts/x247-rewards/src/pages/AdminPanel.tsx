import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { verifySession, logout, getAnalytics, createPartner, updatePartner, deletePartner } from "@/lib/api";
import {
  Sparkles, LogOut, Plus, Trash2, Edit3, Save, X, ExternalLink,
  MousePointer, Eye, FileText, BarChart3, Activity, Users, ArrowRight,
  AlertCircle, CheckCircle2, RefreshCw
} from "lucide-react";
import SiteNav from "@/components/SiteNav";

interface PartnerAnalytics {
  partner: any;
  total: { clicks: number; impressions: number; formFills: number };
  today: { clicks: number; impressions: number; formFills: number };
  weekClicks: number;
}

interface AnalyticsData {
  overview: {
    totalClicks: number;
    totalImpressions: number;
    totalFormFills: number;
    totalPartners: number;
    activePartners: number;
  };
  partners: PartnerAnalytics[];
}

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    name: "", slug: "", tagline: "", description: "", category: "Registration",
    registrationUrl: "", accent: "navy", badge: "", badgeSecondary: "",
    isActive: false, isRequired: false,
  });

  useEffect(() => {
    verifySession().then((valid) => {
      if (!valid) {
        setLocation("/x247-admin-login");
        return;
      }
      loadData();
    });
  }, []);

  async function loadData() {
    try {
      const analytics = await getAnalytics();
      setData(analytics);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleLogout() {
    await logout();
    setLocation("/x247-admin-login");
  }

  function resetForm() {
    setForm({
      name: "", slug: "", tagline: "", description: "", category: "Registration",
      registrationUrl: "", accent: "navy", badge: "", badgeSecondary: "",
      isActive: false, isRequired: false,
    });
  }

  function startEdit(partner: any) {
    setEditingId(partner.id);
    setForm({
      name: partner.name, slug: partner.slug, tagline: partner.tagline,
      description: partner.description, category: partner.category,
      registrationUrl: partner.registrationUrl, accent: partner.accent,
      badge: partner.badge || "", badgeSecondary: partner.badgeSecondary || "",
      isActive: partner.isActive, isRequired: partner.isRequired,
    });
    setShowAddForm(false);
  }

  function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePartner(editingId, form);
        setMessage({ type: "success", text: "Partner updated successfully" });
        setEditingId(null);
      } else {
        await createPartner(form);
        setMessage({ type: "success", text: "Partner added successfully" });
        setShowAddForm(false);
      }
      resetForm();
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save partner" });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    try {
      await deletePartner(id);
      setMessage({ type: "success", text: "Partner deleted" });
      await loadData();
    } catch {
      setMessage({ type: "error", text: "Failed to delete partner" });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/40 font-light">Loading...</div>
      </div>
    );
  }

  const overview = data?.overview;

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNav activePage="home" />
      <div className="noise-overlay" />

      <div className="sticky top-[92px] z-40 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-base tracking-wide text-white font-normal">X247 Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs hover:bg-white/[0.08] transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl py-8 pt-28">
        {message && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm ${message.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Clicks", value: overview?.totalClicks || 0, icon: <MousePointer className="w-4 h-4" />, color: "text-blue-400" },
            { label: "Impressions", value: overview?.totalImpressions || 0, icon: <Eye className="w-4 h-4" />, color: "text-purple-400" },
            { label: "Form Fills", value: overview?.totalFormFills || 0, icon: <FileText className="w-4 h-4" />, color: "text-green-400" },
            { label: "Total Partners", value: overview?.totalPartners || 0, icon: <Users className="w-4 h-4" />, color: "text-amber-400" },
            { label: "Active", value: overview?.activePartners || 0, icon: <Activity className="w-4 h-4" />, color: "text-emerald-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 sm:p-5">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-display font-light text-white">{stat.value}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-display mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-light text-white">Partner Management</h2>
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>

        {(showAddForm || editingId) && (
          <div className="glass-card p-6 sm:p-8 mb-8">
            <div className="card-top-accent card-top-accent-navy" />
            <div className="card-shine" />
            <div className="relative z-[2]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-light text-white">
                  {editingId ? "Edit Partner" : "Add New Partner"}
                </h3>
                <button onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }} className="text-white/30 hover:text-white/60">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Partner Name *</label>
                    <input
                      type="text" required value={form.name}
                      onChange={(e) => { setForm({ ...form, name: e.target.value, slug: form.slug || generateSlug(e.target.value) }); }}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="e.g. Solution Challenge 2026"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Slug *</label>
                    <input
                      type="text" required value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="solution-challenge-2026"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Registration URL *</label>
                  <input
                    type="url" required value={form.registrationUrl}
                    onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="Paste the partner registration link here"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Tagline</label>
                    <input
                      type="text" value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Short tagline"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Category</label>
                    <input
                      type="text" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Registration"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    placeholder="Partner description"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Accent</label>
                    <select
                      value={form.accent}
                      onChange={(e) => setForm({ ...form, accent: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light focus:outline-none focus:border-white/20 transition-colors"
                    >
                      <option value="navy">Navy</option>
                      <option value="red">Red</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Badge</label>
                    <input
                      type="text" value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Required"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">2nd Badge</label>
                    <input
                      type="text" value={form.badgeSecondary}
                      onChange={(e) => setForm({ ...form, badgeSecondary: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Students Only"
                    />
                  </div>
                  <div className="flex flex-col gap-3 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-500" />
                      <span className="text-xs text-white/50 font-light">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isRequired} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} className="accent-blue-500" />
                      <span className="text-xs text-white/50 font-light">Required</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm font-light hover:bg-white/[0.08] transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white text-sm font-display font-light hover:bg-white/[0.12] transition-colors">
                    <Save className="w-4 h-4" />
                    {editingId ? "Update" : "Add Partner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {data?.partners.map((item) => (
            <div key={item.partner.id} className="glass-card p-5 sm:p-6">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base sm:text-lg font-display font-light text-white">{item.partner.name}</h3>
                      {item.partner.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] text-green-400 font-display">LIVE</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] text-white/30 font-display">INACTIVE</span>
                      )}
                      {item.partner.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] text-red-400 font-display">{item.partner.badge}</span>
                      )}
                      {item.partner.badgeSecondary && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-display">{item.partner.badgeSecondary}</span>
                      )}
                    </div>
                    <p className="text-xs text-white/30 font-light truncate">{item.partner.registrationUrl}</p>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <MousePointer className="w-3 h-3" />
                        <span className="text-lg font-display font-light">{item.total.clicks}</span>
                      </div>
                      <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Clicks</div>
                      <div className="text-[9px] text-blue-400/60">+{item.today.clicks} today</div>
                    </div>
                    <div className="w-px h-10 bg-white/[0.06]" />
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-purple-400">
                        <Eye className="w-3 h-3" />
                        <span className="text-lg font-display font-light">{item.total.impressions}</span>
                      </div>
                      <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Impressions</div>
                      <div className="text-[9px] text-purple-400/60">+{item.today.impressions} today</div>
                    </div>
                    <div className="w-px h-10 bg-white/[0.06]" />
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-green-400">
                        <FileText className="w-3 h-3" />
                        <span className="text-lg font-display font-light">{item.total.formFills}</span>
                      </div>
                      <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Form Fills</div>
                      <div className="text-[9px] text-green-400/60">+{item.today.formFills} today</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a href={item.partner.registrationUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button onClick={() => startEdit(item.partner)}
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.partner.id)}
                      className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400/40 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {data?.partners.length === 0 && (
            <div className="glass-card p-12 text-center">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <p className="text-white/30 font-light text-sm">No partners yet. Click "Add Partner" to get started.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
