import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  verifySession, logout, getAnalytics, createPartner, updatePartner, deletePartner,
  generatePartnerAI, getContests, createContest, updateContest, deleteContest,
  getAdminEntries, getWinners, createWinner, deleteWinner, generateContestAI,
  type ContestData, type EntryData, type WinnerData,
} from "@/lib/api";
import {
  Sparkles, LogOut, Plus, Trash2, Edit3, Save, X, ExternalLink,
  MousePointer, Eye, FileText, BarChart3, Activity, Users, ArrowRight,
  AlertCircle, CheckCircle2, RefreshCw, Wand2, Loader2, Trophy, Link2,
  Search, Copy, ChevronRight, Shield, TrendingUp, Target, Award,
  ChevronDown, Hash, Calendar, MapPin, Phone, Mail, UserCheck, Menu,
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

type Tab = "partners" | "contests" | "analytics" | "entries" | "winners";

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
  const [activeTab, setActiveTab] = useState<Tab>("partners");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [contests, setContests] = useState<ContestData[]>([]);
  const [showContestForm, setShowContestForm] = useState(false);
  const [editingContestId, setEditingContestId] = useState<number | null>(null);
  const [showAiContestForm, setShowAiContestForm] = useState(false);
  const [aiContestTheme, setAiContestTheme] = useState("");
  const [aiContestPrize, setAiContestPrize] = useState("");
  const [aiContestGenerating, setAiContestGenerating] = useState(false);
  const [contestForm, setContestForm] = useState({
    name: "", slug: "", description: "", prize: "", prizeValue: "",
    maxSpots: 100, status: "active", partnerIds: [] as number[], endsAt: "",
  });

  const [entries, setEntries] = useState<EntryData[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entrySearch, setEntrySearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

  const [winners, setWinners] = useState<WinnerData[]>([]);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [showWinnerForm, setShowWinnerForm] = useState(false);
  const [winnerForm, setWinnerForm] = useState({
    winnerName: "", winnerCity: "", prize: "", entryCode: "", contestId: "",
  });
  const [winnerSubmitting, setWinnerSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", tagline: "", description: "", category: "Registration",
    registrationUrl: "", accent: "navy", badge: "", badgeSecondary: "",
    isActive: false, isRequired: false, isFeatured: false, entryPoints: 1, whatYouGet: "",
  });

  useEffect(() => {
    verifySession().then((valid) => {
      if (!valid) { setLocation("/x247-admin-login"); return; }
      loadData();
    });
  }, []);

  async function loadData() {
    try {
      const [analytics, contestsList] = await Promise.all([getAnalytics(), getContests()]);
      setData(analytics);
      setContests(contestsList);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function loadEntries() {
    setEntriesLoading(true);
    const result = await getAdminEntries({ limit: 100 });
    setEntries(result.entries);
    setEntriesLoading(false);
  }

  async function loadWinners() {
    setWinnersLoading(true);
    const w = await getWinners();
    setWinners(w);
    setWinnersLoading(false);
  }

  useEffect(() => {
    if (activeTab === "entries" && entries.length === 0) loadEntries();
    if (activeTab === "winners") loadWinners();
  }, [activeTab]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    if (activeTab === "entries") await loadEntries();
    if (activeTab === "winners") await loadWinners();
    setRefreshing(false);
  }

  async function handleLogout() {
    await logout();
    setLocation("/x247-admin-login");
  }

  function showMsg(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function resetForm() {
    setForm({ name: "", slug: "", tagline: "", description: "", category: "Registration", registrationUrl: "", accent: "navy", badge: "", badgeSecondary: "", isActive: false, isRequired: false, isFeatured: false, entryPoints: 1, whatYouGet: "" });
  }

  async function handleAiGenerate() {
    if (!aiUrl && !aiDescription) return;
    setAiGenerating(true);
    try {
      const generated = await generatePartnerAI({ url: aiUrl || undefined, description: aiDescription || undefined });
      setForm({
        name: generated.name || "", slug: generated.slug || "", tagline: generated.tagline || "",
        description: generated.description || "", category: generated.category || "Registration",
        registrationUrl: generated.registrationUrl || aiUrl || "", accent: generated.accent || "navy",
        badge: generated.badge || "", badgeSecondary: generated.badgeSecondary || "",
        whatYouGet: generated.whatYouGet || "", isActive: false, isRequired: false, isFeatured: false, entryPoints: 1,
      });
      setShowAiForm(false); setShowAddForm(true); setEditingId(null);
      setAiUrl(""); setAiDescription("");
      showMsg("success", "AI generated partner details! Review and save below.");
    } catch (err: any) { showMsg("error", err.message || "AI generation failed"); }
    setAiGenerating(false);
  }

  async function handleAiContestGenerate() {
    if (!aiContestTheme && !aiContestPrize) return;
    setAiContestGenerating(true);
    try {
      const generated = await generateContestAI({ theme: aiContestTheme || undefined, prize: aiContestPrize || undefined });
      setContestForm((p) => ({ ...p, name: generated.name, slug: generated.slug, description: generated.description, prize: generated.prize, prizeValue: generated.prizeValue, maxSpots: generated.maxSpots }));
      setShowAiContestForm(false); setShowContestForm(true); setEditingContestId(null);
      setAiContestTheme(""); setAiContestPrize("");
      showMsg("success", "AI generated contest details! Review and save below.");
    } catch (err: any) { showMsg("error", err.message || "AI generation failed"); }
    setAiContestGenerating(false);
  }

  function startEdit(partner: any) {
    setEditingId(partner.id);
    setForm({ name: partner.name, slug: partner.slug, tagline: partner.tagline, description: partner.description, category: partner.category, registrationUrl: partner.registrationUrl, accent: partner.accent, badge: partner.badge || "", badgeSecondary: partner.badgeSecondary || "", isActive: partner.isActive, isRequired: partner.isRequired, isFeatured: partner.isFeatured ?? false, entryPoints: partner.entryPoints ?? 1, whatYouGet: partner.whatYouGet || "" });
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
        showMsg("success", "Partner updated successfully");
        setEditingId(null);
      } else {
        await createPartner(form);
        showMsg("success", "Partner added successfully");
        setShowAddForm(false);
      }
      resetForm(); await loadData();
    } catch (err: any) { showMsg("error", err.message || "Failed to save partner"); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this partner?")) return;
    try { await deletePartner(id); showMsg("success", "Partner deleted"); await loadData(); }
    catch { showMsg("error", "Failed to delete partner"); }
  }

  function resetContestForm() {
    setContestForm({ name: "", slug: "", description: "", prize: "", prizeValue: "", maxSpots: 100, status: "active", partnerIds: [], endsAt: "" });
  }

  function startContestEdit(c: ContestData) {
    setEditingContestId(c.id);
    setContestForm({ name: c.name, slug: c.slug, description: c.description, prize: c.prize, prizeValue: c.prizeValue || "", maxSpots: c.maxSpots, status: c.status, partnerIds: c.partnerIds || [], endsAt: c.endsAt ? new Date(c.endsAt).toISOString().slice(0, 16) : "" });
    setShowContestForm(false);
  }

  async function handleContestSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...contestForm, endsAt: contestForm.endsAt || undefined };
      if (editingContestId) {
        await updateContest(editingContestId, payload);
        showMsg("success", "Contest updated successfully");
        setEditingContestId(null);
      } else {
        await createContest(payload);
        showMsg("success", "Contest created successfully");
        setShowContestForm(false);
      }
      resetContestForm(); await loadData();
    } catch (err: any) { showMsg("error", err.message || "Failed to save contest"); }
  }

  async function handleContestDelete(id: number) {
    if (!confirm("Delete this contest?")) return;
    try { await deleteContest(id); showMsg("success", "Contest deleted"); await loadData(); }
    catch { showMsg("error", "Failed to delete contest"); }
  }

  function toggleContestPartner(partnerId: number) {
    setContestForm((prev) => ({
      ...prev,
      partnerIds: prev.partnerIds.includes(partnerId)
        ? prev.partnerIds.filter((id) => id !== partnerId)
        : [...prev.partnerIds, partnerId],
    }));
  }

  async function handleDeclareWinner(e: React.FormEvent) {
    e.preventDefault();
    setWinnerSubmitting(true);
    try {
      await createWinner({
        winnerName: winnerForm.winnerName,
        winnerCity: winnerForm.winnerCity || undefined,
        prize: winnerForm.prize,
        entryCode: winnerForm.entryCode || undefined,
        contestId: winnerForm.contestId ? parseInt(winnerForm.contestId) : undefined,
      });
      showMsg("success", "Winner declared successfully!");
      setShowWinnerForm(false);
      setWinnerForm({ winnerName: "", winnerCity: "", prize: "", entryCode: "", contestId: "" });
      await loadWinners();
    } catch (err: any) { showMsg("error", err.message || "Failed to declare winner"); }
    setWinnerSubmitting(false);
  }

  async function handleDeleteWinner(id: number) {
    if (!confirm("Remove this winner?")) return;
    try { await deleteWinner(id); showMsg("success", "Winner removed"); await loadWinners(); }
    catch { showMsg("error", "Failed to remove winner"); }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }

  const filteredEntries = entries.filter((e) => {
    if (!entrySearch) return true;
    const q = entrySearch.toLowerCase();
    return e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.entryCode.toLowerCase().includes(q) || e.city.toLowerCase().includes(q);
  });

  const overview = data?.overview;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "partners", label: "Partners", icon: <Link2 className="w-4 h-4" /> },
    { id: "contests", label: "Contests", icon: <Trophy className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "entries", label: "Entries", icon: <FileText className="w-4 h-4" /> },
    { id: "winners", label: "Winners", icon: <Award className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-white/30 text-sm font-light">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <div className="sticky top-[92px] z-40 bg-black/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-base tracking-wide text-white font-normal hidden sm:block">X247 Admin</span>
            <span className="font-display text-base tracking-wide text-white font-normal sm:hidden">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs hover:bg-white/[0.08] transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 text-xs hover:bg-white/[0.08] transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <main className="relative z-10 pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl mb-6">

          {message && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm font-light ${message.type === "success" ? "bg-white/[0.06] border border-white/[0.12] text-white/80" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
              {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Clicks", value: overview?.totalClicks ?? 0, icon: <MousePointer className="w-4 h-4" /> },
              { label: "Impressions", value: overview?.totalImpressions ?? 0, icon: <Eye className="w-4 h-4" /> },
              { label: "Form Fills", value: overview?.totalFormFills ?? 0, icon: <FileText className="w-4 h-4" /> },
              { label: "Partners", value: overview?.totalPartners ?? 0, icon: <Users className="w-4 h-4" /> },
              { label: "Active", value: overview?.activePartners ?? 0, icon: <Activity className="w-4 h-4" /> },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 sm:p-5">
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <div className="text-white/30 mb-2">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-display font-light text-white">{stat.value.toLocaleString()}</div>
                  <div className="text-[10px] text-white/25 uppercase tracking-widest font-display mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider mx-2 sm:mx-3 md:mx-4 lg:mx-5">
          <div className="section-glow-line"><div className="section-glow-line-inner" /></div>

          <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6">

            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-light whitespace-nowrap transition-all flex-shrink-0 ${
                      activeTab === tab.id
                        ? "bg-white/[0.08] border border-white/[0.15] text-white"
                        : "bg-white/[0.02] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

        {/* ── PARTNERS TAB ── */}
        {activeTab === "partners" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-light text-white">Partner Management</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowAiForm(true); setShowAddForm(false); setEditingId(null); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-display font-light hover:bg-white/[0.08] transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Add with AI</span>
                  <span className="sm:hidden">AI</span>
                </button>
                <button
                  onClick={() => { setShowAddForm(true); setEditingId(null); resetForm(); setShowAiForm(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Partner</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* AI Form */}
            {showAiForm && (
              <div className="glass-card p-6 mb-6">
                <div className="relative z-[2]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <Wand2 className="w-4 h-4 text-white/60" />
                      <h3 className="text-base font-display font-light text-white">Add Partner with AI</h3>
                    </div>
                    <button onClick={() => setShowAiForm(false)} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
                  </div>
                  <p className="text-xs text-white/35 font-light mb-4">Paste a registration URL or describe the partner — AI fills all details automatically.</p>
                  <div className="space-y-3">
                    <input type="url" value={aiUrl} onChange={(e) => setAiUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="https://example.com/register" />
                    <div className="flex items-center gap-3"><div className="h-px flex-1 bg-white/[0.06]" /><span className="text-[10px] text-white/25 uppercase tracking-widest">or</span><div className="h-px flex-1 bg-white/[0.06]" /></div>
                    <textarea value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none" placeholder="e.g. Google Solution Challenge 2026 — a coding hackathon for students" />
                    <button onClick={handleAiGenerate} disabled={aiGenerating || (!aiUrl && !aiDescription)} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {aiGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Partner Details</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Partner Form */}
            {(showAddForm || editingId) && (
              <div className="glass-card p-6 mb-6">
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-display font-light text-white">{editingId ? "Edit Partner" : "Add New Partner"}</h3>
                    <button onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Partner Name *</label>
                        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || generateSlug(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="e.g. Solution Challenge 2026" />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Slug *</label>
                        <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="solution-challenge-2026" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Registration URL *</label>
                      <input type="url" required value={form.registrationUrl} onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="https://partner.com/register" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Tagline</label>
                        <input type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="Short tagline" />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Category</label>
                        <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="Registration" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Description</label>
                      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none" placeholder="Partner description" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Accent</label>
                        <select value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light focus:outline-none focus:border-white/20 transition-colors appearance-none" style={{ colorScheme: "dark" }}>
                          <option value="navy" className="bg-[#0a0a0a]">Navy</option>
                          <option value="red" className="bg-[#0a0a0a]">Red</option>
                          <option value="neutral" className="bg-[#0a0a0a]">Neutral</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Badge</label>
                        <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="Required" />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">2nd Badge</label>
                        <input type="text" value={form.badgeSecondary} onChange={(e) => setForm({ ...form, badgeSecondary: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="Students Only" />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Entry Points</label>
                        <input type="number" min={1} max={100} value={form.entryPoints} onChange={(e) => setForm({ ...form, entryPoints: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light focus:outline-none focus:border-white/20 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">What You Get</label>
                      <textarea value={form.whatYouGet} onChange={(e) => setForm({ ...form, whatYouGet: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none" placeholder="e.g. Win up to ₹10 Lakh in prizes, free internship, certification worth ₹5000" />
                    </div>
                    <div className="flex items-center gap-6 flex-wrap">
                      {[
                        { key: "isActive", label: "Active" },
                        { key: "isRequired", label: "Required" },
                        { key: "isFeatured", label: "Featured" },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="accent-white" />
                          <span className="text-xs text-white/50 font-light">{label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm font-light hover:bg-white/[0.08] transition-colors">Cancel</button>
                      <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white text-sm font-display font-light hover:bg-white/[0.12] transition-colors">
                        <Save className="w-4 h-4" />{editingId ? "Update" : "Add Partner"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Partner List */}
            <div className="space-y-3">
              {data?.partners.map((item) => (
                <div key={item.partner.id} className="glass-card p-4 sm:p-5">
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-base font-display font-light text-white">{item.partner.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-display ${item.partner.isActive ? "bg-white/[0.08] border border-white/[0.12] text-white/60" : "bg-white/[0.03] border border-white/[0.06] text-white/25"}`}>{item.partner.isActive ? "LIVE" : "INACTIVE"}</span>
                          {item.partner.isFeatured && <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[9px] text-white/50 font-display">★ FEATURED</span>}
                          {item.partner.badge && <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] text-white/35 font-display">{item.partner.badge}</span>}
                        </div>
                        <p className="text-xs text-white/25 font-light truncate">{item.partner.registrationUrl}</p>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                        {[
                          { icon: <MousePointer className="w-3 h-3" />, total: item.total.clicks, today: item.today.clicks, label: "Clicks" },
                          { icon: <Eye className="w-3 h-3" />, total: item.total.impressions, today: item.today.impressions, label: "Views" },
                          { icon: <FileText className="w-3 h-3" />, total: item.total.formFills, today: item.today.formFills, label: "Fills" },
                        ].map((s) => (
                          <div key={s.label} className="text-center">
                            <div className="flex items-center gap-1 text-white/60 justify-center">{s.icon}<span className="text-base font-display font-light">{s.total}</span></div>
                            <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">{s.label}</div>
                            <div className="text-[9px] text-white/30">+{s.today} today</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={item.partner.registrationUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors"><ExternalLink className="w-4 h-4" /></a>
                        <button onClick={() => startEdit(item.partner)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.partner.id)} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/25 hover:text-white/50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(data?.partners.length ?? 0) === 0 && (
                <div className="glass-card p-12 text-center">
                  <div className="card-shine" />
                  <div className="relative z-[2]"><p className="text-white/25 font-light text-sm">No partners yet. Click "Add Partner" to get started.</p></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CONTESTS TAB ── */}
        {activeTab === "contests" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-light text-white">Contest Management</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowAiContestForm(true); setShowContestForm(false); setEditingContestId(null); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-display font-light hover:bg-white/[0.08] transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Add with AI</span>
                  <span className="sm:hidden">AI</span>
                </button>
                <button
                  onClick={() => { setShowContestForm(true); setEditingContestId(null); resetContestForm(); setShowAiContestForm(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Contest</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* AI Contest Form */}
            {showAiContestForm && (
              <div className="glass-card p-6 mb-6">
                <div className="relative z-[2]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <Wand2 className="w-4 h-4 text-white/60" />
                      <h3 className="text-base font-display font-light text-white">Create Contest with AI</h3>
                    </div>
                    <button onClick={() => setShowAiContestForm(false)} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
                  </div>
                  <p className="text-xs text-white/35 font-light mb-4">Give a theme and prize — AI will generate the contest name, slug, and description.</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-display text-white/30 uppercase tracking-widest block mb-2">Contest Theme</label>
                        <input type="text" value={aiContestTheme} onChange={(e) => setAiContestTheme(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="e.g. Student Tech Giveaway" />
                      </div>
                      <div>
                        <label className="text-[10px] font-display text-white/30 uppercase tracking-widest block mb-2">Prize Hint</label>
                        <input type="text" value={aiContestPrize} onChange={(e) => setAiContestPrize(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="e.g. iPhone 16 Pro, ₹10,000" />
                      </div>
                    </div>
                    <button onClick={handleAiContestGenerate} disabled={aiContestGenerating || (!aiContestTheme && !aiContestPrize)} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {aiContestGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Contest</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Contest Form */}
            {(showContestForm || editingContestId !== null) && (
              <div className="glass-card p-6 mb-6">
                <div className="relative z-[2]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display font-light text-white">{editingContestId ? "Edit Contest" : "New Contest"}</h3>
                    <button onClick={() => { setShowContestForm(false); setEditingContestId(null); resetContestForm(); }} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleContestSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Name *</label>
                        <input value={contestForm.name} onChange={(e) => setContestForm((p) => ({ ...p, name: e.target.value, slug: p.slug || generateSlug(e.target.value) }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors" placeholder="Monthly Mega Giveaway" required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Slug *</label>
                        <input value={contestForm.slug} onChange={(e) => setContestForm((p) => ({ ...p, slug: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors" placeholder="monthly-mega-giveaway" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Description *</label>
                      <textarea value={contestForm.description} onChange={(e) => setContestForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors resize-none" placeholder="Describe the contest" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Prize *</label>
                        <input value={contestForm.prize} onChange={(e) => setContestForm((p) => ({ ...p, prize: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors" placeholder="iPhone 16 Pro" required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Prize Value</label>
                        <input value={contestForm.prizeValue} onChange={(e) => setContestForm((p) => ({ ...p, prizeValue: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors" placeholder="$1,199" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Max Spots</label>
                        <input type="number" value={contestForm.maxSpots} onChange={(e) => setContestForm((p) => ({ ...p, maxSpots: parseInt(e.target.value) || 100 }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:border-white/[0.25] focus:outline-none transition-colors" min={1} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Status</label>
                        <select value={contestForm.status} onChange={(e) => setContestForm((p) => ({ ...p, status: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:border-white/[0.25] focus:outline-none transition-colors" style={{ colorScheme: "dark" }}>
                          <option value="active" className="bg-black">Active</option>
                          <option value="upcoming" className="bg-black">Upcoming</option>
                          <option value="ended" className="bg-black">Ended</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Ends At</label>
                        <input type="datetime-local" value={contestForm.endsAt} onChange={(e) => setContestForm((p) => ({ ...p, endsAt: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:border-white/[0.25] focus:outline-none transition-colors [color-scheme:dark]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display flex items-center gap-1.5"><Link2 className="w-3 h-3" />Linked Partners</label>
                      <p className="text-[11px] text-white/25 mb-3 font-light">Select which partners users must register with to enter this contest.</p>
                      {data?.partners && data.partners.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {data.partners.map((item: PartnerAnalytics) => (
                            <button key={item.partner.id} type="button" onClick={() => toggleContestPartner(item.partner.id)} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${contestForm.partnerIds.includes(item.partner.id) ? "bg-white/[0.08] border-white/[0.2]" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"}`}>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${contestForm.partnerIds.includes(item.partner.id) ? "bg-white/20 border-white/40" : "border-white/10"}`}>
                                {contestForm.partnerIds.includes(item.partner.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white/80 font-light truncate">{item.partner.name}</div>
                                <div className="text-[10px] text-white/30">{item.partner.isActive ? "Active" : "Inactive"} · {item.partner.entryPoints ?? 1} pts</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/25 font-light">No partners available.</p>
                      )}
                      {contestForm.partnerIds.length > 0 && <div className="mt-2 text-[11px] text-white/35 font-light">{contestForm.partnerIds.length} partner{contestForm.partnerIds.length !== 1 ? "s" : ""} linked</div>}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.08] border border-white/[0.15] text-white text-sm font-display font-light hover:bg-white/[0.12] transition-colors">
                        <Save className="w-4 h-4" />{editingContestId ? "Update Contest" : "Create Contest"}
                      </button>
                      {editingContestId && (
                        <button type="button" onClick={() => { setEditingContestId(null); resetContestForm(); }} className="px-4 py-3 rounded-xl text-white/40 text-sm hover:text-white/60 transition-colors">Cancel</button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Contest List */}
            <div className="space-y-3">
              {contests.map((contest) => (
                <div key={contest.id} className="glass-card p-5 sm:p-6">
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Trophy className="w-4 h-4 text-white/40" />
                          <h3 className="font-display font-light text-white">{contest.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-display ${contest.status === "active" ? "bg-white/10 text-white/60" : contest.status === "upcoming" ? "bg-white/[0.06] text-white/40" : "bg-white/[0.04] text-white/25"}`}>{contest.status}</span>
                        </div>
                        <p className="text-xs text-white/30 font-light line-clamp-2">{contest.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => startContestEdit(contest)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleContestDelete(contest.id)} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/25 hover:text-white/50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 text-sm flex-wrap">
                      <div><span className="text-white/25 text-[10px] uppercase tracking-widest font-display block">Prize</span><div className="text-white/60 font-light">{contest.prize}{contest.prizeValue ? ` (${contest.prizeValue})` : ""}</div></div>
                      <div className="w-px h-8 bg-white/[0.06]" />
                      <div><span className="text-white/25 text-[10px] uppercase tracking-widest font-display block">Entries</span><div className="text-white/60 font-light">{contest.totalEntries} / {contest.maxSpots}</div></div>
                      <div className="w-px h-8 bg-white/[0.06]" />
                      <div><span className="text-white/25 text-[10px] uppercase tracking-widest font-display block">Partners</span><div className="text-white/60 font-light">{(contest.partnerIds || []).length} linked</div></div>
                      {contest.endsAt && (<><div className="w-px h-8 bg-white/[0.06]" /><div><span className="text-white/25 text-[10px] uppercase tracking-widest font-display block">Ends</span><div className="text-white/60 font-light">{new Date(contest.endsAt).toLocaleDateString()}</div></div></>)}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4 pt-4 border-t border-white/[0.04]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-white/25 font-display uppercase tracking-widest">Fill Rate</span>
                        <span className="text-[10px] text-white/40 font-light">{Math.round((contest.totalEntries / contest.maxSpots) * 100)}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-white/[0.3] rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((contest.totalEntries / contest.maxSpots) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {contests.length === 0 && (
                <div className="glass-card p-12 text-center"><div className="card-shine" /><div className="relative z-[2]"><p className="text-white/25 font-light text-sm">No contests yet. Click "Add Contest" to create one.</p></div></div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-light text-white">Link Performance & Analytics</h2>
            </div>

            {/* Conversion Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {(() => {
                const clicks = overview?.totalClicks ?? 0;
                const impressions = overview?.totalImpressions ?? 0;
                const fills = overview?.totalFormFills ?? 0;
                const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";
                const cvr = clicks > 0 ? ((fills / clicks) * 100).toFixed(1) : "0.0";
                const overall = impressions > 0 ? ((fills / impressions) * 100).toFixed(1) : "0.0";
                return [
                  { label: "Click-Through Rate", value: `${ctr}%`, sub: `${clicks} clicks from ${impressions} views`, icon: <TrendingUp className="w-4 h-4" /> },
                  { label: "Conversion Rate", value: `${cvr}%`, sub: `${fills} fills from ${clicks} clicks`, icon: <Target className="w-4 h-4" /> },
                  { label: "Overall Funnel", value: `${overall}%`, sub: `${fills} registrations from ${impressions} views`, icon: <BarChart3 className="w-4 h-4" /> },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-5">
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <div className="text-white/30 mb-2">{stat.icon}</div>
                      <div className="text-3xl font-display font-light text-white mb-1">{stat.value}</div>
                      <div className="text-[10px] text-white/25 uppercase tracking-widest font-display">{stat.label}</div>
                      <div className="text-xs text-white/30 font-light mt-1">{stat.sub}</div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Per-partner breakdown */}
            <h3 className="text-sm font-display font-light text-white/50 uppercase tracking-widest mb-4">Partner Link Tracing</h3>
            <div className="space-y-4">
              {(data?.partners ?? []).filter((item) => item.partner.isActive).map((item) => {
                const maxClicks = Math.max(...(data?.partners ?? []).map((p) => p.total.clicks), 1);
                const maxFills = Math.max(...(data?.partners ?? []).map((p) => p.total.formFills), 1);
                const ctr = item.total.impressions > 0 ? ((item.total.clicks / item.total.impressions) * 100).toFixed(1) : "0.0";
                const cvr = item.total.clicks > 0 ? ((item.total.formFills / item.total.clicks) * 100).toFixed(1) : "0.0";
                return (
                  <div key={item.partner.id} className="glass-card p-5 sm:p-6">
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-display font-light text-white">{item.partner.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-white/25 font-light">{item.partner.registrationUrl}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/30 font-light">Today</div>
                          <div className="text-sm text-white/60 font-display">+{item.today.clicks} clicks</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {[
                          { label: "Impressions", value: item.total.impressions, max: Math.max(...(data?.partners ?? []).map((p) => p.total.impressions), 1), color: "bg-white/[0.15]" },
                          { label: "Clicks", value: item.total.clicks, max: maxClicks, color: "bg-white/[0.25]" },
                          { label: "Form Fills", value: item.total.formFills, max: maxFills, color: "bg-white/[0.4]" },
                        ].map((bar) => (
                          <div key={bar.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-white/30 uppercase tracking-widest font-display">{bar.label}</span>
                              <span className="text-xs text-white/50 font-light">{bar.value.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: bar.max > 0 ? `${(bar.value / bar.max) * 100}%` : "0%" }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/[0.04] grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: "CTR", value: `${ctr}%` },
                          { label: "CVR", value: `${cvr}%` },
                          { label: "Week Clicks", value: item.weekClicks },
                          { label: "Entry Points", value: item.partner.entryPoints ?? 1 },
                        ].map((m) => (
                          <div key={m.label} className="text-center">
                            <div className="text-base font-display font-light text-white">{m.value}</div>
                            <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(data?.partners ?? []).filter((p) => p.partner.isActive).length === 0 && (
                <div className="glass-card p-12 text-center"><div className="card-shine" /><div className="relative z-[2]"><p className="text-white/25 font-light text-sm">No active partners to analyze yet.</p></div></div>
              )}
            </div>
          </div>
        )}

        {/* ── ENTRIES TAB ── */}
        {activeTab === "entries" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-light text-white">Giveaway Entries <span className="text-white/30 text-sm font-light ml-2">{filteredEntries.length} shown</span></h2>
              <button onClick={loadEntries} disabled={entriesLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs hover:bg-white/[0.08] transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${entriesLoading ? "animate-spin" : ""}`} />Reload
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                value={entrySearch}
                onChange={(e) => setEntrySearch(e.target.value)}
                placeholder="Search by name, email, city, or entry code..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {entriesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center"><div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" /><div className="text-white/30 text-sm font-light">Loading entries...</div></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="glass-card p-4 sm:p-5">
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-sm font-display font-light text-white">{entry.isAnonymous ? "Anonymous" : entry.fullName}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[9px] font-display text-white/40">{entry.entryCount} {entry.entryCount === 1 ? "entry" : "entries"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/30 font-light flex-wrap">
                            {!entry.isAnonymous && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{entry.email}</span>}
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.city}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(entry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyCode(entry.entryCode)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 text-xs hover:text-white/70 transition-colors"
                            title="Copy entry code"
                          >
                            {copiedCode === entry.entryCode ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline font-mono text-[10px]">{entry.entryCode}</span>
                          </button>
                          <button onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/30 hover:text-white/60 transition-colors">
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedEntry === entry.id ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Entry code pill */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-white/30 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06]">{entry.entryCode}</span>
                        {entry.partnerNames.map((pName, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/30 font-light">{pName}</span>
                        ))}
                      </div>

                      {/* Expanded details */}
                      {expandedEntry === entry.id && (
                        <div className="mt-4 pt-4 border-t border-white/[0.04] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          {[
                            { label: "Phone", value: entry.phone || "—" },
                            { label: "Age", value: entry.age || "—" },
                            { label: "Partners", value: `${entry.completedPartners.length} completed` },
                            { label: "Screenshot", value: entry.screenshotConfirmed ? "Confirmed" : "No" },
                          ].map((f) => (
                            <div key={f.label}>
                              <div className="text-[9px] text-white/25 uppercase tracking-widest font-display mb-0.5">{f.label}</div>
                              <div className="text-white/50 font-light">{f.value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredEntries.length === 0 && !entriesLoading && (
                  <div className="glass-card p-12 text-center"><div className="card-shine" /><div className="relative z-[2]"><p className="text-white/25 font-light text-sm">{entrySearch ? "No entries match your search." : "No entries yet."}</p></div></div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── WINNERS TAB ── */}
        {activeTab === "winners" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-light text-white">Winners</h2>
              <button
                onClick={() => setShowWinnerForm((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-colors"
              >
                {showWinnerForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showWinnerForm ? "Cancel" : "Declare Winner"}
              </button>
            </div>

            {/* Declare Winner Form */}
            {showWinnerForm && (
              <div className="glass-card p-6 mb-6">
                <div className="relative z-[2]">
                  <div className="flex items-center gap-2 mb-5">
                    <Award className="w-4 h-4 text-white/50" />
                    <h3 className="font-display font-light text-white">Declare a Winner</h3>
                  </div>
                  <form onSubmit={handleDeclareWinner} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Winner Name *</label>
                        <input value={winnerForm.winnerName} onChange={(e) => setWinnerForm((p) => ({ ...p, winnerName: e.target.value }))} required className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors" placeholder="Full name" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">City</label>
                        <input value={winnerForm.winnerCity} onChange={(e) => setWinnerForm((p) => ({ ...p, winnerCity: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors" placeholder="City" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Prize *</label>
                        <input value={winnerForm.prize} onChange={(e) => setWinnerForm((p) => ({ ...p, prize: e.target.value }))} required className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors" placeholder="iPhone 16 Pro" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Entry Code</label>
                        <input value={winnerForm.entryCode} onChange={(e) => setWinnerForm((p) => ({ ...p, entryCode: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/[0.25] focus:outline-none transition-colors font-mono" placeholder="X247-XXXX-XXXX" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2 font-display">Contest</label>
                      <select value={winnerForm.contestId} onChange={(e) => setWinnerForm((p) => ({ ...p, contestId: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:border-white/[0.25] focus:outline-none transition-colors" style={{ colorScheme: "dark" }}>
                        <option value="" className="bg-black">— Select contest (optional) —</option>
                        {contests.map((c) => <option key={c.id} value={c.id} className="bg-black">{c.name}</option>)}
                      </select>
                    </div>
                    <button type="submit" disabled={winnerSubmitting} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.08] border border-white/[0.15] text-white text-sm font-display font-light hover:bg-white/[0.12] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {winnerSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                      {winnerSubmitting ? "Saving..." : "Declare Winner"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {winnersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center"><div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" /><div className="text-white/30 text-sm font-light">Loading winners...</div></div>
              </div>
            ) : (
              <div className="space-y-3">
                {winners.map((winner) => (
                  <div key={winner.id} className="glass-card p-5 sm:p-6">
                    <div className="card-shine" />
                    <div className="relative z-[2] flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Trophy className="w-4 h-4 text-white/40" />
                          <h4 className="font-display font-light text-white">{winner.winnerName}</h4>
                          {winner.winnerCity && <span className="flex items-center gap-1 text-[10px] text-white/30 font-light"><MapPin className="w-3 h-3" />{winner.winnerCity}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/35 font-light flex-wrap">
                          <span className="font-medium text-white/50">{winner.prize}</span>
                          <span>·</span>
                          <span>{winner.contestName}</span>
                          {winner.entryCode && <><span>·</span><span className="font-mono text-[10px]">{winner.entryCode}</span></>}
                          <span>·</span>
                          <span>{new Date(winner.announcedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteWinner(winner.id)} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/25 hover:text-white/50 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {winners.length === 0 && (
                  <div className="glass-card p-12 text-center"><div className="card-shine" /><div className="relative z-[2]"><Award className="w-8 h-8 text-white/10 mx-auto mb-3" /><p className="text-white/25 font-light text-sm">No winners declared yet. Use "Declare Winner" to add one.</p></div></div>
                )}
              </div>
            )}
          </div>
        )}

          </div>
        </div>
      </main>
    </div>
  );
}
