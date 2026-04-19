import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  verifySession, logout, getAnalytics, createPartner, updatePartner, deletePartner,
  generatePartnerAI, getContests, createContest, updateContest, deleteContest,
  getAdminEntries, getWinners, createWinner, deleteWinner, generateContestAI,
  getAdminReferrals, updateReferralStatus,
  type ContestData, type EntryData, type WinnerData, type ReferralPartner,
} from "@/lib/api";
import {
  Sparkles, LogOut, Plus, Trash2, Edit3, Save, X, ExternalLink,
  MousePointer, Eye, FileText, BarChart3, Activity, Users, ArrowRight,
  AlertCircle, CheckCircle2, RefreshCw, Wand2, Loader2, Trophy, Link2,
  Search, Copy, ChevronRight, Shield, TrendingUp, Target, Award,
  ChevronDown, Hash, Calendar, MapPin, Phone, Mail, UserCheck, Menu,
  Zap, Clock, Database, Settings, ArrowUpRight, Circle,
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

type Tab = "partners" | "contests" | "analytics" | "entries" | "winners" | "referrals";

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

  const [referralApplications, setReferralApplications] = useState<ReferralPartner[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralActionLoading, setReferralActionLoading] = useState<number | null>(null);

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

  async function loadReferrals() {
    setReferralsLoading(true);
    try {
      const r = await getAdminReferrals();
      setReferralApplications(r);
    } catch (err) { console.error(err); }
    setReferralsLoading(false);
  }

  async function handleReferralAction(id: number, status: string) {
    setReferralActionLoading(id);
    try {
      await updateReferralStatus(id, status);
      showMsg("success", `Referral partner ${status}`);
      await loadReferrals();
    } catch (err: any) { showMsg("error", err.message || "Action failed"); }
    setReferralActionLoading(null);
  }

  useEffect(() => {
    if (activeTab === "entries" && entries.length === 0) loadEntries();
    if (activeTab === "winners") loadWinners();
    if (activeTab === "referrals") loadReferrals();
  }, [activeTab]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    if (activeTab === "entries") await loadEntries();
    if (activeTab === "winners") await loadWinners();
    if (activeTab === "referrals") await loadReferrals();
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "partners", label: "Partners", icon: <Link2 className="w-4 h-4" />, count: data?.partners.length },
    { id: "contests", label: "Contests", icon: <Trophy className="w-4 h-4" />, count: contests.length },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "entries", label: "Entries", icon: <FileText className="w-4 h-4" />, count: entries.length || undefined },
    { id: "winners", label: "Winners", icon: <Award className="w-4 h-4" />, count: winners.length || undefined },
    { id: "referrals", label: "Referrals", icon: <Users className="w-4 h-4" />, count: referralApplications.filter(r => r.status === "pending").length || undefined },
  ];

  const inputCls = "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/[0.25] focus:bg-white/[0.06] transition-all";
  const labelCls = "block text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] mb-2";
  const btnPrimary = "flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.1] border border-white/[0.18] text-white text-sm font-display font-light hover:bg-white/[0.15] transition-all";
  const btnSecondary = "flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm font-display font-light hover:bg-white/[0.08] hover:text-white/80 transition-all";
  const btnGhost = "flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/35 text-xs hover:bg-white/[0.06] hover:text-white/60 transition-all";
  const iconBtn = "p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/35 hover:text-white/70 hover:bg-white/[0.08] transition-all";
  const iconBtnDanger = "p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-white/25 hover:text-red-400/70 hover:bg-red-500/[0.06] hover:border-red-500/[0.12] transition-all";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040404] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-white/60 animate-pulse" />
          </div>
          <div className="text-white/40 text-sm font-light font-display tracking-widest uppercase">Initialising dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#040404" }}>
      {/* subtle noise */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")", opacity: 0.4, zIndex: 0 }} />

      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(4,4,4,0.96)", backdropFilter: "blur(24px)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 max-w-screen-2xl mx-auto">
          {/* Left: Logo + breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
              <Shield className="w-4 h-4 text-white/80" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-xs text-white/30 font-display">
                <span className="text-white/60 font-medium">X247</span>
                <ChevronRight className="w-3 h-3" />
                <span>Control Panel</span>
              </div>
            </div>
            <div className="sm:hidden text-sm font-display text-white/80">X247 Admin</div>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full ml-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
              <span className="text-[9px] text-white/40 font-display uppercase tracking-widest hidden sm:inline">Live</span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/25 font-display mr-2">
              <Clock className="w-3 h-3" />
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <button
              onClick={handleRefresh}
              className={btnGhost}
              title="Refresh data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/30 text-xs hover:text-red-400/70 transition-all"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-6 pb-16 max-w-screen-2xl mx-auto px-4 sm:px-6">

        {/* ── TOAST MESSAGE ── */}
        {message && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-6 text-sm font-light transition-all ${
            message.type === "success"
              ? "text-white/80"
              : "text-red-400/90"
          }`} style={{
            background: message.type === "success" ? "rgba(255,255,255,0.06)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${message.type === "success" ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.18)"}`,
          }}>
            {message.type === "success"
              ? <CheckCircle2 className="w-4 h-4 shrink-0 text-white/50" />
              : <AlertCircle className="w-4 h-4 shrink-0 text-red-400/70" />
            }
            <span>{message.text}</span>
          </div>
        )}

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Clicks", value: overview?.totalClicks ?? 0, icon: <MousePointer className="w-4 h-4" />, sub: "all time", delta: `+${overview?.totalClicks ?? 0}` },
            { label: "Impressions", value: overview?.totalImpressions ?? 0, icon: <Eye className="w-4 h-4" />, sub: "page views", delta: null },
            { label: "Form Fills", value: overview?.totalFormFills ?? 0, icon: <FileText className="w-4 h-4" />, sub: "registrations", delta: null },
            { label: "Partners", value: overview?.totalPartners ?? 0, icon: <Link2 className="w-4 h-4" />, sub: "total", delta: null },
            { label: "Active", value: overview?.activePartners ?? 0, icon: <Activity className="w-4 h-4" />, sub: "live now", delta: null },
          ].map((stat, i) => (
            <div key={stat.label} className="relative rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* accent top line */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: i === 4 ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" : "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="text-white/50">{stat.icon}</div>
                  </div>
                  {i === 4 && (overview?.activePartners ?? 0) > 0 && (
                    <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                  )}
                </div>
                <div className="text-3xl sm:text-4xl font-display font-light text-white tracking-tight leading-none mb-1">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-[9px] font-display uppercase tracking-[0.18em] text-white/30 mt-2">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── DIVIDER ── */}
        <div className="h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

        {/* ── TAB NAVIGATION ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-light whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/35 hover:text-white/60"
              }`}
              style={activeTab === tab.id ? {
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.16)",
              } : {
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className={activeTab === tab.id ? "text-white/70" : "text-white/30"}>{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-display" style={{ background: activeTab === tab.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)", color: activeTab === tab.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════ PARTNERS TAB ══════════════════════════════════════ */}
        {activeTab === "partners" && (
          <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-light text-white">Partner Management</h2>
                <p className="text-xs text-white/30 font-light mt-0.5">{data?.partners.length ?? 0} partners · {overview?.activePartners ?? 0} active</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowAiForm(true); setShowAddForm(false); setEditingId(null); }} className={btnSecondary}>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI Generate</span>
                  <span className="sm:hidden">AI</span>
                </button>
                <button onClick={() => { setShowAddForm(true); setEditingId(null); resetForm(); setShowAiForm(false); }} className={btnPrimary}>
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Partner</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* AI Form */}
            {showAiForm && (
              <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <Sparkles className="w-3.5 h-3.5 text-white/60" />
                    </div>
                    <h3 className="text-sm font-display font-light text-white">AI Partner Generator</h3>
                  </div>
                  <button onClick={() => setShowAiForm(false)} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-xs text-white/30 font-light mb-4 leading-relaxed">Paste a registration URL or describe the partner — AI fills all details automatically.</p>
                <div className="space-y-3">
                  <input type="url" value={aiUrl} onChange={(e) => setAiUrl(e.target.value)} className={inputCls} placeholder="https://partner.com/register" />
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-display">or describe</span>
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                  </div>
                  <textarea value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} rows={2} className={inputCls + " resize-none"} placeholder="e.g. Google Solution Challenge 2026 — coding hackathon for students" />
                  <button onClick={handleAiGenerate} disabled={aiGenerating || (!aiUrl && !aiDescription)} className={btnPrimary + " w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"}>
                    {aiGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Partner Details</>}
                  </button>
                </div>
              </div>
            )}

            {/* Partner Form */}
            {(showAddForm || editingId) && (
              <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-display font-light text-white">{editingId ? "Edit Partner" : "New Partner"}</h3>
                  <button onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Partner Name *</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || generateSlug(e.target.value) })} className={inputCls} placeholder="e.g. Solution Challenge 2026" /></div>
                    <div><label className={labelCls}>Slug *</label><input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} placeholder="solution-challenge-2026" /></div>
                  </div>
                  <div><label className={labelCls}>Registration URL *</label><input type="url" required value={form.registrationUrl} onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })} className={inputCls} placeholder="https://partner.com/register" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Tagline</label><input type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} placeholder="Short tagline" /></div>
                    <div><label className={labelCls}>Category</label><input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} placeholder="Registration" /></div>
                  </div>
                  <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls + " resize-none"} placeholder="Partner description" /></div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className={labelCls}>Accent</label>
                      <select value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className={inputCls + " appearance-none"} style={{ colorScheme: "dark" }}>
                        <option value="navy" className="bg-[#040404]">Navy</option>
                        <option value="red" className="bg-[#040404]">Red</option>
                        <option value="neutral" className="bg-[#040404]">Neutral</option>
                      </select>
                    </div>
                    <div><label className={labelCls}>Badge</label><input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={inputCls} placeholder="Required" /></div>
                    <div><label className={labelCls}>2nd Badge</label><input type="text" value={form.badgeSecondary} onChange={(e) => setForm({ ...form, badgeSecondary: e.target.value })} className={inputCls} placeholder="Students Only" /></div>
                    <div><label className={labelCls}>Entry Points</label><input type="number" min={1} max={100} value={form.entryPoints} onChange={(e) => setForm({ ...form, entryPoints: parseInt(e.target.value) || 1 })} className={inputCls} /></div>
                  </div>
                  <div><label className={labelCls}>What You Get</label><textarea value={form.whatYouGet} onChange={(e) => setForm({ ...form, whatYouGet: e.target.value })} rows={2} className={inputCls + " resize-none"} placeholder="e.g. Win up to ₹10 Lakh in prizes, free internship, certification worth ₹5000" /></div>
                  <div className="flex items-center gap-6 flex-wrap py-1">
                    {[{ key: "isActive", label: "Active" }, { key: "isRequired", label: "Required" }, { key: "isFeatured", label: "Featured" }].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => setForm({ ...form, [key]: !(form as any)[key] })}
                          className="w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-all"
                          style={{ background: (form as any)[key] ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${(form as any)[key] ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"}` }}
                        >
                          {(form as any)[key] && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-xs text-white/45 font-light">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }} className={btnSecondary}>Cancel</button>
                    <button type="submit" className={btnPrimary}><Save className="w-4 h-4" />{editingId ? "Update Partner" : "Add Partner"}</button>
                  </div>
                </form>
              </div>
            )}

            {/* Partner List */}
            <div className="space-y-3">
              {data?.partners.map((item) => (
                <div key={item.partner.id} className="rounded-2xl overflow-hidden transition-all hover:border-white/[0.1]" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="text-sm font-display font-light text-white">{item.partner.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-display tracking-widest uppercase ${item.partner.isActive ? "text-white/65" : "text-white/25"}`} style={{ background: item.partner.isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${item.partner.isActive ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)"}` }}>
                            {item.partner.isActive ? "● Live" : "○ Off"}
                          </span>
                          {item.partner.isFeatured && <span className="px-2 py-0.5 rounded-full text-[9px] text-white/45 font-display" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>★ Featured</span>}
                          {item.partner.badge && <span className="px-2 py-0.5 rounded-full text-[9px] text-white/35 font-display" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>{item.partner.badge}</span>}
                        </div>
                        <p className="text-[11px] text-white/25 font-light font-mono truncate">{item.partner.registrationUrl}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-5 sm:gap-7">
                        {[
                          { icon: <MousePointer className="w-3 h-3" />, total: item.total.clicks, today: item.today.clicks, label: "Clicks" },
                          { icon: <Eye className="w-3 h-3" />, total: item.total.impressions, today: item.today.impressions, label: "Views" },
                          { icon: <FileText className="w-3 h-3" />, total: item.total.formFills, today: item.today.formFills, label: "Fills" },
                        ].map((s) => (
                          <div key={s.label} className="text-center min-w-[40px]">
                            <div className="flex items-center gap-1 text-white/55 justify-center mb-0.5">
                              <span className="text-white/30">{s.icon}</span>
                              <span className="text-lg font-display font-light leading-none">{s.total}</span>
                            </div>
                            <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">{s.label}</div>
                            {s.today > 0 && <div className="text-[9px] text-white/30 mt-0.5">+{s.today}</div>}
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <a href={item.partner.registrationUrl} target="_blank" rel="noopener noreferrer" className={iconBtn} title="Open link"><ExternalLink className="w-3.5 h-3.5" /></a>
                        <button onClick={() => startEdit(item.partner)} className={iconBtn} title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(item.partner.id)} className={iconBtnDanger} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(data?.partners.length ?? 0) === 0 && (
                <div className="rounded-2xl p-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Link2 className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-white/25 font-light text-sm">No partners yet. Add your first partner above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ CONTESTS TAB ══════════════════════════════════════ */}
        {activeTab === "contests" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-light text-white">Contest Management</h2>
                <p className="text-xs text-white/30 font-light mt-0.5">{contests.length} contests · {contests.filter(c => c.status === "active").length} active</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowAiContestForm(true); setShowContestForm(false); setEditingContestId(null); }} className={btnSecondary}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI Generate</span>
                  <span className="sm:hidden">AI</span>
                </button>
                <button onClick={() => { setShowContestForm(true); setEditingContestId(null); resetContestForm(); setShowAiContestForm(false); }} className={btnPrimary}>
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Contest</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* AI Contest Form */}
            {showAiContestForm && (
              <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <Sparkles className="w-3.5 h-3.5 text-white/60" />
                    </div>
                    <h3 className="text-sm font-display font-light text-white">AI Contest Generator</h3>
                  </div>
                  <button onClick={() => setShowAiContestForm(false)} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-xs text-white/30 font-light mb-4">Give a theme and prize — AI generates the full contest details.</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>Contest Theme</label><input type="text" value={aiContestTheme} onChange={(e) => setAiContestTheme(e.target.value)} className={inputCls} placeholder="e.g. Student Tech Giveaway" /></div>
                    <div><label className={labelCls}>Prize Hint</label><input type="text" value={aiContestPrize} onChange={(e) => setAiContestPrize(e.target.value)} className={inputCls} placeholder="e.g. iPhone 16 Pro, ₹10,000" /></div>
                  </div>
                  <button onClick={handleAiContestGenerate} disabled={aiContestGenerating || (!aiContestTheme && !aiContestPrize)} className={btnPrimary + " w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"}>
                    {aiContestGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Contest</>}
                  </button>
                </div>
              </div>
            )}

            {/* Contest Form */}
            {(showContestForm || editingContestId !== null) && (
              <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-display font-light text-white">{editingContestId ? "Edit Contest" : "New Contest"}</h3>
                  <button onClick={() => { setShowContestForm(false); setEditingContestId(null); resetContestForm(); }} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleContestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Name *</label><input value={contestForm.name} onChange={(e) => setContestForm((p) => ({ ...p, name: e.target.value, slug: p.slug || generateSlug(e.target.value) }))} className={inputCls} placeholder="Monthly Mega Giveaway" required /></div>
                    <div><label className={labelCls}>Slug *</label><input value={contestForm.slug} onChange={(e) => setContestForm((p) => ({ ...p, slug: e.target.value }))} className={inputCls} placeholder="monthly-mega-giveaway" required /></div>
                  </div>
                  <div><label className={labelCls}>Description *</label><textarea value={contestForm.description} onChange={(e) => setContestForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + " resize-none"} placeholder="Describe the contest" required /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={labelCls}>Prize *</label><input value={contestForm.prize} onChange={(e) => setContestForm((p) => ({ ...p, prize: e.target.value }))} className={inputCls} placeholder="iPhone 16 Pro" required /></div>
                    <div><label className={labelCls}>Prize Value</label><input value={contestForm.prizeValue} onChange={(e) => setContestForm((p) => ({ ...p, prizeValue: e.target.value }))} className={inputCls} placeholder="$1,199" /></div>
                    <div><label className={labelCls}>Max Spots</label><input type="number" value={contestForm.maxSpots} onChange={(e) => setContestForm((p) => ({ ...p, maxSpots: parseInt(e.target.value) || 100 }))} className={inputCls} min={1} required /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Status</label>
                      <select value={contestForm.status} onChange={(e) => setContestForm((p) => ({ ...p, status: e.target.value }))} className={inputCls + " appearance-none"} style={{ colorScheme: "dark" }}>
                        <option value="active" className="bg-[#040404]">Active</option>
                        <option value="upcoming" className="bg-[#040404]">Upcoming</option>
                        <option value="ended" className="bg-[#040404]">Ended</option>
                      </select>
                    </div>
                    <div><label className={labelCls}>Ends At</label><input type="datetime-local" value={contestForm.endsAt} onChange={(e) => setContestForm((p) => ({ ...p, endsAt: e.target.value }))} className={inputCls} style={{ colorScheme: "dark" }} /></div>
                  </div>
                  <div>
                    <label className={labelCls + " flex items-center gap-1.5"}><Link2 className="w-3 h-3" />Linked Partners</label>
                    <p className="text-[11px] text-white/25 mb-3 font-light">Users must register with these partners to enter.</p>
                    {data?.partners && data.partners.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {data.partners.map((item: PartnerAnalytics) => (
                          <button key={item.partner.id} type="button" onClick={() => toggleContestPartner(item.partner.id)} className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all" style={{ background: contestForm.partnerIds.includes(item.partner.id) ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)", borderColor: contestForm.partnerIds.includes(item.partner.id) ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}>
                            <div className="w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0" style={{ background: contestForm.partnerIds.includes(item.partner.id) ? "rgba(255,255,255,0.2)" : "transparent", borderColor: contestForm.partnerIds.includes(item.partner.id) ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)" }}>
                              {contestForm.partnerIds.includes(item.partner.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white/75 font-light truncate">{item.partner.name}</div>
                              <div className="text-[10px] text-white/30">{item.partner.isActive ? "Active" : "Inactive"} · {item.partner.entryPoints ?? 1} pts</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : <p className="text-xs text-white/25 font-light">No partners available.</p>}
                    {contestForm.partnerIds.length > 0 && <div className="mt-2 text-[11px] text-white/35 font-light">{contestForm.partnerIds.length} partner{contestForm.partnerIds.length !== 1 ? "s" : ""} linked</div>}
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button type="submit" className={btnPrimary}><Save className="w-4 h-4" />{editingContestId ? "Update Contest" : "Create Contest"}</button>
                    {editingContestId && <button type="button" onClick={() => { setEditingContestId(null); resetContestForm(); }} className={btnSecondary}>Cancel</button>}
                  </div>
                </form>
              </div>
            )}

            {/* Contest List */}
            <div className="space-y-3">
              {contests.map((contest) => {
                const fillPct = Math.min(100, Math.round((contest.totalEntries / contest.maxSpots) * 100));
                return (
                  <div key={contest.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <Trophy className="w-4 h-4 text-white/35 shrink-0" />
                            <h3 className="font-display font-light text-white">{contest.name}</h3>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-display`} style={{
                              background: contest.status === "active" ? "rgba(255,255,255,0.1)" : contest.status === "upcoming" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${contest.status === "active" ? "rgba(255,255,255,0.18)" : contest.status === "upcoming" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
                              color: contest.status === "active" ? "rgba(255,255,255,0.7)" : contest.status === "upcoming" ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.25)",
                            }}>
                              {contest.status === "active" && "● "}{contest.status}
                            </span>
                          </div>
                          <p className="text-xs text-white/30 font-light line-clamp-2 leading-relaxed">{contest.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => startContestEdit(contest)} className={iconBtn}><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleContestDelete(contest.id)} className={iconBtnDanger}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 sm:gap-8 text-xs flex-wrap mb-4">
                        {[
                          { label: "Prize", value: `${contest.prize}${contest.prizeValue ? ` (${contest.prizeValue})` : ""}` },
                          { label: "Entries", value: `${contest.totalEntries} / ${contest.maxSpots}` },
                          { label: "Partners", value: `${(contest.partnerIds || []).length} linked` },
                          ...(contest.endsAt ? [{ label: "Ends", value: new Date(contest.endsAt).toLocaleDateString() }] : []),
                        ].map((item, i) => (
                          <React.Fragment key={item.label}>
                            {i > 0 && <div className="w-px h-6 shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />}
                            <div>
                              <div className="text-[9px] text-white/25 uppercase tracking-widest font-display mb-0.5">{item.label}</div>
                              <div className="text-white/55 font-light">{item.value}</div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Fill rate bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] text-white/25 font-display uppercase tracking-widest">Fill Rate</span>
                          <span className="text-[9px] text-white/40 font-light">{fillPct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: fillPct > 80 ? "rgba(255,255,255,0.5)" : fillPct > 50 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {contests.length === 0 && (
                <div className="rounded-2xl p-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Trophy className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-white/25 font-light text-sm">No contests yet. Create your first contest above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ ANALYTICS TAB ══════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-display font-light text-white">Link Performance & Analytics</h2>
              <p className="text-xs text-white/30 font-light mt-0.5">Conversion funnel · partner-level breakdown</p>
            </div>

            {/* Funnel stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {(() => {
                const clicks = overview?.totalClicks ?? 0;
                const impressions = overview?.totalImpressions ?? 0;
                const fills = overview?.totalFormFills ?? 0;
                const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";
                const cvr = clicks > 0 ? ((fills / clicks) * 100).toFixed(1) : "0.0";
                const overall = impressions > 0 ? ((fills / impressions) * 100).toFixed(1) : "0.0";
                return [
                  { label: "Click-Through Rate", value: `${ctr}%`, sub: `${clicks} clicks / ${impressions} views`, icon: <TrendingUp className="w-4 h-4" /> },
                  { label: "Conversion Rate", value: `${cvr}%`, sub: `${fills} fills / ${clicks} clicks`, icon: <Target className="w-4 h-4" /> },
                  { label: "Overall Funnel", value: `${overall}%`, sub: `${fills} registrations / ${impressions} views`, icon: <BarChart3 className="w-4 h-4" /> },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 text-white/40" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>{stat.icon}</div>
                    <div className="text-3xl font-display font-light text-white mb-1">{stat.value}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">{stat.label}</div>
                    <div className="text-xs text-white/30 font-light mt-1">{stat.sub}</div>
                  </div>
                ));
              })()}
            </div>

            {/* Per-partner breakdown */}
            <h3 className="text-[10px] font-display font-medium text-white/30 uppercase tracking-[0.2em] mb-4">Partner Link Tracing</h3>
            <div className="space-y-4">
              {(data?.partners ?? []).filter((item) => item.partner.isActive).map((item) => {
                const maxClicks = Math.max(...(data?.partners ?? []).map((p) => p.total.clicks), 1);
                const maxFills = Math.max(...(data?.partners ?? []).map((p) => p.total.formFills), 1);
                const ctr = item.total.impressions > 0 ? ((item.total.clicks / item.total.impressions) * 100).toFixed(1) : "0.0";
                const cvr = item.total.clicks > 0 ? ((item.total.formFills / item.total.clicks) * 100).toFixed(1) : "0.0";
                return (
                  <div key={item.partner.id} className="rounded-2xl p-5 sm:p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h4 className="font-display font-light text-white mb-0.5">{item.partner.name}</h4>
                        <div className="text-[10px] text-white/25 font-light font-mono">{item.partner.registrationUrl}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-white/25 font-light mb-0.5">Today</div>
                        <div className="text-sm text-white/55 font-display">+{item.today.clicks} clicks</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      {[
                        { label: "Impressions", value: item.total.impressions, max: Math.max(...(data?.partners ?? []).map((p) => p.total.impressions), 1), opacity: 0.18 },
                        { label: "Clicks", value: item.total.clicks, max: maxClicks, opacity: 0.28 },
                        { label: "Form Fills", value: item.total.formFills, max: maxFills, opacity: 0.42 },
                      ].map((bar) => (
                        <div key={bar.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] text-white/30 uppercase tracking-widest font-display">{bar.label}</span>
                            <span className="text-xs text-white/50 font-light">{bar.value.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: bar.max > 0 ? `${(bar.value / bar.max) * 100}%` : "0%", background: `rgba(255,255,255,${bar.opacity})` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      {[
                        { label: "CTR", value: `${ctr}%` },
                        { label: "CVR", value: `${cvr}%` },
                        { label: "Week Clicks", value: item.weekClicks },
                        { label: "Entry Points", value: item.partner.entryPoints ?? 1 },
                      ].map((m) => (
                        <div key={m.label} className="text-center">
                          <div className="text-lg font-display font-light text-white">{m.value}</div>
                          <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {(data?.partners ?? []).filter((p) => p.partner.isActive).length === 0 && (
                <div className="rounded-2xl p-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <BarChart3 className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-white/25 font-light text-sm">No active partners to analyze yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ ENTRIES TAB ══════════════════════════════════════ */}
        {activeTab === "entries" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-light text-white">Giveaway Entries</h2>
                <p className="text-xs text-white/30 font-light mt-0.5">{filteredEntries.length} {entrySearch ? "matching" : "total"} entries</p>
              </div>
              <button onClick={loadEntries} disabled={entriesLoading} className={btnGhost}>
                <RefreshCw className={`w-3.5 h-3.5 ${entriesLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Reload</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text"
                value={entrySearch}
                onChange={(e) => setEntrySearch(e.target.value)}
                placeholder="Search by name, email, city, or entry code..."
                className={inputCls + " pl-10"}
              />
            </div>

            {entriesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-6 h-6 border border-white/15 border-t-white/50 rounded-full animate-spin mx-auto mb-3" />
                  <div className="text-white/30 text-sm font-light">Loading entries...</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl overflow-hidden transition-all" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h4 className="text-sm font-display font-light text-white">{entry.isAnonymous ? "Anonymous" : entry.fullName}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-display text-white/40" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                              {entry.entryCount} {entry.entryCount === 1 ? "entry" : "entries"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/30 font-light flex-wrap">
                            {!entry.isAnonymous && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{entry.email}</span>}
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.city}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(entry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => copyCode(entry.entryCode)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: copiedCode === entry.entryCode ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}
                            title="Copy entry code"
                          >
                            {copiedCode === entry.entryCode ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline font-mono text-[10px]">{entry.entryCode}</span>
                          </button>
                          <button onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)} className={iconBtn}>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedEntry === entry.id ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-white/25 px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>{entry.entryCode}</span>
                        {entry.partnerNames.map((pName, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[10px] text-white/30 font-light" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>{pName}</span>
                        ))}
                      </div>

                      {/* Expanded */}
                      {expandedEntry === entry.id && (
                        <div className="mt-4 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          {[
                            { label: "Phone", value: entry.phone || "—" },
                            { label: "Age", value: entry.age || "—" },
                            { label: "Partners", value: `${entry.completedPartners.length} completed` },
                            { label: "Screenshot", value: entry.screenshotConfirmed ? "✓ Confirmed" : "Not confirmed" },
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
                  <div className="rounded-2xl p-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Database className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-white/25 font-light text-sm">{entrySearch ? "No entries match your search." : "No entries yet."}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ WINNERS TAB ══════════════════════════════════════ */}
        {activeTab === "winners" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-light text-white">Winners</h2>
                <p className="text-xs text-white/30 font-light mt-0.5">{winners.length} declared</p>
              </div>
              <button onClick={() => setShowWinnerForm((v) => !v)} className={showWinnerForm ? btnSecondary : btnPrimary}>
                {showWinnerForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showWinnerForm ? "Cancel" : "Declare Winner"}
              </button>
            </div>

            {/* Declare Form */}
            {showWinnerForm && (
              <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-display font-light text-white">Declare a Winner</h3>
                </div>
                <form onSubmit={handleDeclareWinner} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Winner Name *</label><input value={winnerForm.winnerName} onChange={(e) => setWinnerForm((p) => ({ ...p, winnerName: e.target.value }))} required className={inputCls} placeholder="Full name" /></div>
                    <div><label className={labelCls}>City</label><input value={winnerForm.winnerCity} onChange={(e) => setWinnerForm((p) => ({ ...p, winnerCity: e.target.value }))} className={inputCls} placeholder="City" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Prize *</label><input value={winnerForm.prize} onChange={(e) => setWinnerForm((p) => ({ ...p, prize: e.target.value }))} required className={inputCls} placeholder="iPhone 16 Pro" /></div>
                    <div><label className={labelCls}>Entry Code</label><input value={winnerForm.entryCode} onChange={(e) => setWinnerForm((p) => ({ ...p, entryCode: e.target.value }))} className={inputCls + " font-mono"} placeholder="X247-XXXX-XXXX" /></div>
                  </div>
                  <div>
                    <label className={labelCls}>Contest</label>
                    <select value={winnerForm.contestId} onChange={(e) => setWinnerForm((p) => ({ ...p, contestId: e.target.value }))} className={inputCls + " appearance-none"} style={{ colorScheme: "dark" }}>
                      <option value="" className="bg-[#040404]">— Select contest (optional) —</option>
                      {contests.map((c) => <option key={c.id} value={c.id} className="bg-[#040404]">{c.name}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={winnerSubmitting} className={btnPrimary + " disabled:opacity-40 disabled:cursor-not-allowed"}>
                    {winnerSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                    {winnerSubmitting ? "Saving..." : "Declare Winner"}
                  </button>
                </form>
              </div>
            )}

            {winnersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-6 h-6 border border-white/15 border-t-white/50 rounded-full animate-spin mx-auto mb-3" />
                  <div className="text-white/30 text-sm font-light">Loading winners...</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {winners.map((winner) => (
                  <div key={winner.id} className="rounded-2xl p-5 sm:p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                          <Trophy className="w-4 h-4 text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-display font-light text-white">{winner.winnerName}</h4>
                            {winner.winnerCity && <span className="flex items-center gap-1 text-[10px] text-white/30 font-light"><MapPin className="w-3 h-3" />{winner.winnerCity}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/35 font-light flex-wrap">
                            <span className="font-medium text-white/55">{winner.prize}</span>
                            <span className="text-white/20">·</span>
                            <span>{winner.contestName}</span>
                            {winner.entryCode && <><span className="text-white/20">·</span><span className="font-mono text-[10px] text-white/30">{winner.entryCode}</span></>}
                            <span className="text-white/20">·</span>
                            <span>{new Date(winner.announcedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteWinner(winner.id)} className={iconBtnDanger + " shrink-0"}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
                {winners.length === 0 && (
                  <div className="rounded-2xl p-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Award className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-white/25 font-light text-sm">No winners declared yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ REFERRALS TAB ══════════════════════════════════════ */}
        {activeTab === "referrals" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-light text-white">Referral Partners</h2>
                <p className="text-xs text-white/30 font-light mt-0.5">
                  {referralApplications.filter(r => r.status === "pending").length} pending · {referralApplications.filter(r => r.status === "approved").length} approved
                </p>
              </div>
              <button onClick={loadReferrals} className={btnGhost}>
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {referralsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-6 h-6 border border-white/15 border-t-white/50 rounded-full animate-spin mx-auto mb-3" />
                  <div className="text-white/30 text-sm font-light">Loading applications...</div>
                </div>
              </div>
            ) : referralApplications.length === 0 ? (
              <div className="rounded-2xl p-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Users className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/25 font-light text-sm">No referral applications yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referralApplications.map((app) => (
                  <div key={app.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
                    {/* Status accent bar */}
                    <div className="h-0.5" style={{ background: app.status === "approved" ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" : app.status === "pending" ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" : "transparent" }} />
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="font-display font-light text-white">{app.name}</h4>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-display uppercase tracking-widest" style={{
                              background: app.status === "approved" ? "rgba(255,255,255,0.1)" : app.status === "pending" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${app.status === "approved" ? "rgba(255,255,255,0.18)" : app.status === "pending" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
                              color: app.status === "approved" ? "rgba(255,255,255,0.7)" : app.status === "pending" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
                            }}>
                              <span className={`w-1.5 h-1.5 rounded-full ${app.status === "approved" ? "bg-white/60" : app.status === "pending" ? "bg-white/30 animate-pulse" : "bg-white/20"}`} />
                              {app.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-white/30 font-light mb-2">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.email}</span>
                            {app.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{app.phone}</span>}
                            <span className="font-mono text-[10px] text-white/20">{app.code}</span>
                          </div>
                          {app.bio && <p className="text-xs text-white/25 font-light line-clamp-2 mb-3">{app.bio}</p>}
                          <div className="flex items-center gap-4 text-[10px] text-white/20 font-light">
                            <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" />{(app as any).totalClicks ?? 0} clicks</span>
                            <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{(app as any).totalConversions ?? 0} conversions</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {app.status === "pending" && (
                            <>
                              <button onClick={() => handleReferralAction(app.id, "approved")} disabled={referralActionLoading === app.id} className={btnPrimary + " disabled:opacity-40"}>
                                {referralActionLoading === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                Approve
                              </button>
                              <button onClick={() => handleReferralAction(app.id, "rejected")} disabled={referralActionLoading === app.id} className={btnGhost + " disabled:opacity-40"}>
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === "approved" && (
                            <button onClick={() => handleReferralAction(app.id, "suspended")} disabled={referralActionLoading === app.id} className={btnGhost + " disabled:opacity-40"}>
                              <Shield className="w-3.5 h-3.5" />Suspend
                            </button>
                          )}
                          {(app.status === "rejected" || app.status === "suspended") && (
                            <button onClick={() => handleReferralAction(app.id, "approved")} disabled={referralActionLoading === app.id} className={btnPrimary + " disabled:opacity-40"}>
                              {referralActionLoading === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Re-approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
