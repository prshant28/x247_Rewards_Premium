import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { verifySession, logout, getAnalytics, createPartner, updatePartner, deletePartner, generatePartnerAI, getContests, createContest, updateContest, deleteContest, type ContestData } from "@/lib/api";
import {
  Sparkles, LogOut, Plus, Trash2, Edit3, Save, X, ExternalLink,
  MousePointer, Eye, FileText, BarChart3, Activity, Users, ArrowRight,
  AlertCircle, CheckCircle2, RefreshCw, Wand2, Loader2, Trophy, Link2
} from "lucide-react";

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
  const [showAiForm, setShowAiForm] = useState(false);
  const [aiUrl, setAiUrl] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const [activeTab, setActiveTab] = useState<"partners" | "contests">("partners");
  const [contests, setContests] = useState<ContestData[]>([]);
  const [showContestForm, setShowContestForm] = useState(false);
  const [editingContestId, setEditingContestId] = useState<number | null>(null);
  const [contestForm, setContestForm] = useState({
    name: "", slug: "", description: "", prize: "", prizeValue: "",
    maxSpots: 100, status: "active", partnerIds: [] as number[],
    endsAt: "",
  });

  const [form, setForm] = useState({
    name: "", slug: "", tagline: "", description: "", category: "Registration",
    registrationUrl: "", accent: "navy", badge: "", badgeSecondary: "",
    isActive: false, isRequired: false, isFeatured: false, entryPoints: 1, whatYouGet: "",
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
      const [analytics, contestsList] = await Promise.all([
        getAnalytics(),
        getContests(),
      ]);
      setData(analytics);
      setContests(contestsList);
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
      isActive: false, isRequired: false, isFeatured: false, entryPoints: 1, whatYouGet: "",
    });
  }

  async function handleAiGenerate() {
    if (!aiUrl && !aiDescription) return;
    setAiGenerating(true);
    try {
      const generated = await generatePartnerAI({
        url: aiUrl || undefined,
        description: aiDescription || undefined,
      });
      setForm({
        name: generated.name || "",
        slug: generated.slug || "",
        tagline: generated.tagline || "",
        description: generated.description || "",
        category: generated.category || "Registration",
        registrationUrl: generated.registrationUrl || aiUrl || "",
        accent: generated.accent || "navy",
        badge: generated.badge || "",
        badgeSecondary: generated.badgeSecondary || "",
        whatYouGet: generated.whatYouGet || "",
        isActive: false,
        isRequired: false,
        entryPoints: 1,
      });
      setShowAiForm(false);
      setShowAddForm(true);
      setEditingId(null);
      setAiUrl("");
      setAiDescription("");
      setMessage({ type: "success", text: "AI generated partner details! Review and save below." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "AI generation failed" });
    }
    setAiGenerating(false);
  }

  function startEdit(partner: any) {
    setEditingId(partner.id);
    setForm({
      name: partner.name, slug: partner.slug, tagline: partner.tagline,
      description: partner.description, category: partner.category,
      registrationUrl: partner.registrationUrl, accent: partner.accent,
      badge: partner.badge || "", badgeSecondary: partner.badgeSecondary || "",
      isActive: partner.isActive, isRequired: partner.isRequired,
      isFeatured: partner.isFeatured ?? false,
      entryPoints: partner.entryPoints ?? 1, whatYouGet: partner.whatYouGet || "",
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

  function resetContestForm() {
    setContestForm({ name: "", slug: "", description: "", prize: "", prizeValue: "", maxSpots: 100, status: "active", partnerIds: [], endsAt: "" });
  }

  function startContestEdit(c: ContestData) {
    setEditingContestId(c.id);
    setContestForm({
      name: c.name, slug: c.slug, description: c.description, prize: c.prize,
      prizeValue: c.prizeValue || "", maxSpots: c.maxSpots, status: c.status,
      partnerIds: c.partnerIds || [],
      endsAt: c.endsAt ? new Date(c.endsAt).toISOString().slice(0, 16) : "",
    });
    setShowContestForm(false);
  }

  function generateSlugFromName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleContestSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...contestForm, endsAt: contestForm.endsAt || undefined };
      if (editingContestId) {
        await updateContest(editingContestId, payload);
        setMessage({ type: "success", text: "Contest updated successfully" });
        setEditingContestId(null);
      } else {
        await createContest(payload);
        setMessage({ type: "success", text: "Contest created successfully" });
        setShowContestForm(false);
      }
      resetContestForm();
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save contest" });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleContestDelete(id: number) {
    if (!confirm("Are you sure you want to delete this contest?")) return;
    try {
      await deleteContest(id);
      setMessage({ type: "success", text: "Contest deleted" });
      await loadData();
    } catch {
      setMessage({ type: "error", text: "Failed to delete contest" });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  function toggleContestPartner(partnerId: number) {
    setContestForm((prev) => ({
      ...prev,
      partnerIds: prev.partnerIds.includes(partnerId)
        ? prev.partnerIds.filter((id) => id !== partnerId)
        : [...prev.partnerIds, partnerId],
    }));
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
        <div className="section-divider px-4 sm:px-6 lg:px-8 py-6">
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

        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("partners")}
            className={`px-5 py-2.5 rounded-xl text-sm font-display font-light transition-all ${activeTab === "partners" ? "bg-white/[0.08] border border-white/[0.15] text-white" : "bg-white/[0.02] border border-white/[0.06] text-white/40 hover:text-white/60"}`}
          >
            Partners
          </button>
          <button
            onClick={() => setActiveTab("contests")}
            className={`px-5 py-2.5 rounded-xl text-sm font-display font-light transition-all ${activeTab === "contests" ? "bg-white/[0.08] border border-white/[0.15] text-white" : "bg-white/[0.02] border border-white/[0.06] text-white/40 hover:text-white/60"}`}
          >
            Contests
          </button>
        </div>

        {activeTab === "partners" && (<>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-light text-white">Partner Management</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAiForm(true); setShowAddForm(false); setEditingId(null); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-display font-light hover:bg-purple-500/20 transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              Add with AI
            </button>
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null); resetForm(); setShowAiForm(false); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Partner
            </button>
          </div>
        </div>

        {showAiForm && (
          <div className="glass-card p-6 sm:p-8 mb-8">
            <div className="card-top-accent" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(147, 51, 234, 0.3) 20%, rgba(168, 85, 247, 0.5) 50%, rgba(147, 51, 234, 0.3) 80%, transparent 100%)" }} />
            <div className="relative z-[2]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-display font-light text-white">Add Partner with AI</h3>
                </div>
                <button onClick={() => setShowAiForm(false)} className="text-white/30 hover:text-white/60">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-white/40 font-light mb-5">Paste a registration URL or describe the partner — AI will auto-fill all the details for you.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Registration URL</label>
                  <input
                    type="url"
                    value={aiUrl}
                    onChange={(e) => setAiUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-purple-500/30 transition-colors"
                    placeholder="https://example.com/register"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">or</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                <div>
                  <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Description</label>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-purple-500/30 transition-colors resize-none"
                    placeholder="e.g. Google Solution Challenge 2026 - a coding hackathon for students"
                  />
                </div>

                <button
                  onClick={handleAiGenerate}
                  disabled={aiGenerating || (!aiUrl && !aiDescription)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-300 text-sm font-display font-light hover:bg-purple-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Partner Details
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light focus:outline-none focus:border-white/20 transition-colors appearance-none"
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="navy" className="bg-[#0a0a0a] text-white">Navy</option>
                      <option value="red" className="bg-[#0a0a0a] text-white">Red</option>
                      <option value="neutral" className="bg-[#0a0a0a] text-white">Neutral</option>
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
                  <div>
                    <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Entry Points</label>
                    <input
                      type="number" min={1} max={100} value={form.entryPoints}
                      onChange={(e) => setForm({ ...form, entryPoints: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">What You Get (Prize/Benefit)</label>
                  <textarea
                    value={form.whatYouGet}
                    onChange={(e) => setForm({ ...form, whatYouGet: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    placeholder="e.g. Win up to ₹10 Lakh in prizes, free internship opportunity, certification worth ₹5000"
                  />
                  <p className="text-[10px] text-white/25 mt-1 font-light">Shown in the 'What You Get' tab on the partner page</p>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-white" />
                    <span className="text-xs text-white/50 font-light">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isRequired} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} className="accent-white" />
                    <span className="text-xs text-white/50 font-light">Required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-white" />
                    <span className="text-xs text-white/50 font-light">Featured <span className="text-white/30">(shows in Featured filter)</span></span>
                  </label>
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
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-[9px] text-white/60 font-display">LIVE</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] text-white/30 font-display">INACTIVE</span>
                      )}
                      {item.partner.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[9px] text-white/50 font-display">★ FEATURED</span>
                      )}
                      {item.partner.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] text-white/40 font-display">{item.partner.badge}</span>
                      )}
                      {item.partner.badgeSecondary && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] text-white/30 font-display">{item.partner.badgeSecondary}</span>
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
        </>)}

        {activeTab === "contests" && (<>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-light text-white">Contest Management</h2>
          <button
            onClick={() => { setShowContestForm(true); setEditingContestId(null); resetContestForm(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Contest
          </button>
        </div>

        {(showContestForm || editingContestId !== null) && (
          <div className="glass-card p-6 sm:p-8 mb-8">
            <div className="relative z-[2]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-light text-white">{editingContestId ? "Edit Contest" : "New Contest"}</h3>
                <button onClick={() => { setShowContestForm(false); setEditingContestId(null); resetContestForm(); }}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleContestSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Name *</label>
                    <input value={contestForm.name}
                      onChange={(e) => setContestForm((p) => ({ ...p, name: e.target.value, slug: p.slug || generateSlugFromName(e.target.value) }))}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors"
                      placeholder="Monthly Mega Giveaway" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Slug *</label>
                    <input value={contestForm.slug}
                      onChange={(e) => setContestForm((p) => ({ ...p, slug: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors"
                      placeholder="monthly-mega-giveaway" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Description *</label>
                  <textarea value={contestForm.description}
                    onChange={(e) => setContestForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors resize-none"
                    placeholder="Enter a description for this contest" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Prize *</label>
                    <input value={contestForm.prize}
                      onChange={(e) => setContestForm((p) => ({ ...p, prize: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors"
                      placeholder="iPhone 16 Pro" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Prize Value</label>
                    <input value={contestForm.prizeValue}
                      onChange={(e) => setContestForm((p) => ({ ...p, prizeValue: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors"
                      placeholder="$1,199" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Max Spots *</label>
                    <input type="number" value={contestForm.maxSpots}
                      onChange={(e) => setContestForm((p) => ({ ...p, maxSpots: parseInt(e.target.value) || 100 }))}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors"
                      min={1} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Status</label>
                    <select value={contestForm.status}
                      onChange={(e) => setContestForm((p) => ({ ...p, status: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:border-white/[0.25] focus:outline-none transition-colors">
                      <option value="active" className="bg-black">Active</option>
                      <option value="upcoming" className="bg-black">Upcoming</option>
                      <option value="ended" className="bg-black">Ended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Ends At</label>
                    <input type="datetime-local" value={contestForm.endsAt}
                      onChange={(e) => setContestForm((p) => ({ ...p, endsAt: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:border-white/[0.25] focus:outline-none transition-colors [color-scheme:dark]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">
                    <Link2 className="w-3 h-3 inline mr-1" />
                    Linked Partners
                  </label>
                  <p className="text-[11px] text-white/25 mb-3 font-light">Select which partners users must register with to enter this contest.</p>
                  {data?.partners && data.partners.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.partners.map((item: PartnerAnalytics) => (
                        <button
                          key={item.partner.id}
                          type="button"
                          onClick={() => toggleContestPartner(item.partner.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            contestForm.partnerIds.includes(item.partner.id)
                              ? "bg-white/[0.08] border-white/[0.2]"
                              : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            contestForm.partnerIds.includes(item.partner.id)
                              ? "bg-white/20 border-white/40"
                              : "border-white/10"
                          }`}>
                            {contestForm.partnerIds.includes(item.partner.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white/80 font-light truncate">{item.partner.name}</div>
                            <div className="text-[10px] text-white/30">{item.partner.isActive ? "Active" : "Inactive"}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/25 font-light">No partners available. Create partners first.</p>
                  )}
                  {contestForm.partnerIds.length > 0 && (
                    <div className="mt-2 text-[11px] text-white/35 font-light">{contestForm.partnerIds.length} partner{contestForm.partnerIds.length !== 1 ? "s" : ""} selected</div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.08] border border-white/[0.15] text-white text-sm font-display font-light hover:bg-white/[0.12] transition-colors">
                    <Save className="w-4 h-4" />
                    {editingContestId ? "Update Contest" : "Create Contest"}
                  </button>
                  {editingContestId && (
                    <button type="button" onClick={() => { setEditingContestId(null); resetContestForm(); }}
                      className="px-4 py-3 rounded-xl text-white/40 text-sm hover:text-white/60 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {contests.map((contest) => (
            <div key={contest.id} className="glass-card p-5 sm:p-6">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-white/50" />
                      <h3 className="font-display font-light text-white text-lg">{contest.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-display ${
                        contest.status === "active" ? "bg-white/10 text-white/60" : contest.status === "upcoming" ? "bg-white/[0.06] text-white/40" : "bg-white/[0.04] text-white/25"
                      }`}>{contest.status}</span>
                    </div>
                    <p className="text-xs text-white/35 font-light mt-1 line-clamp-2">{contest.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => startContestEdit(contest)}
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleContestDelete(contest.id)}
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/30 hover:text-white/60 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-white/25 text-[10px] uppercase tracking-widest font-display">Prize</span>
                    <div className="text-white/70 font-light">{contest.prize}{contest.prizeValue ? ` (${contest.prizeValue})` : ""}</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div>
                    <span className="text-white/25 text-[10px] uppercase tracking-widest font-display">Entries</span>
                    <div className="text-white/70 font-light">{contest.totalEntries} / {contest.maxSpots}</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div>
                    <span className="text-white/25 text-[10px] uppercase tracking-widest font-display">Partners</span>
                    <div className="text-white/70 font-light">{(contest.partnerIds || []).length} linked</div>
                  </div>
                  {contest.endsAt && (
                    <>
                      <div className="w-px h-8 bg-white/[0.06]" />
                      <div>
                        <span className="text-white/25 text-[10px] uppercase tracking-widest font-display">Ends</span>
                        <div className="text-white/70 font-light">{new Date(contest.endsAt).toLocaleDateString()}</div>
                      </div>
                    </>
                  )}
                </div>

                {(contest.partnerIds || []).length > 0 && data?.partners && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="flex flex-wrap gap-1.5">
                      {contest.partnerIds.map((pid) => {
                        const p = data.partners.find((item: PartnerAnalytics) => item.partner.id === pid);
                        return p ? (
                          <span key={pid} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 font-light">
                            {p.partner.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {contests.length === 0 && (
            <div className="glass-card p-12 text-center">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <p className="text-white/30 font-light text-sm">No contests yet. Click "Add Contest" to get started.</p>
              </div>
            </div>
          )}
        </div>
        </>)}

        </div>
      </main>
    </div>
  );
}
