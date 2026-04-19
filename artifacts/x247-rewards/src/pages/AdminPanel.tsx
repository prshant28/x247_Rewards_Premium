import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Command as CommandPrimitive } from "cmdk";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart,
} from "recharts";
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
  Bell, Command as CommandIcon, Brain, Send, MessageSquare, LayoutDashboard,
  TrendingDown, Lightbulb, Bot, ChevronUp, MoreHorizontal, Filter, Download,
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

type Tab = "overview" | "partners" | "contests" | "analytics" | "entries" | "winners" | "referrals";

// ── Mock notifications data ──
type Notification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "success" | "info" | "warning" | "alert" | "ai";
  read: boolean;
};

// ── Sparkline component (inline SVG, monochrome) ──
function Sparkline({ data, height = 32, accent = "rgba(255,255,255,0.6)" }: { data: number[]; height?: number; accent?: string }) {
  if (!data.length) return null;
  const w = 80, h = height;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`sparkfill-${accent}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sparkfill-${accent})`} />
      <polyline points={points} fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Generate mock 7-day trend data based on a total ──
function genTrend(total: number, seed = 1): number[] {
  const base = Math.max(1, total / 14);
  return Array.from({ length: 14 }, (_, i) => {
    const noise = Math.sin((i + seed) * 1.7) * base * 0.4 + Math.cos((i + seed) * 0.9) * base * 0.3;
    return Math.max(0, Math.round(base + noise));
  });
}

// ── Format relative time ──
function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Advanced UI state ──
  const [globalSearch, setGlobalSearch] = useState("");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "ai"; text: string; time: Date }[]>([
    { role: "ai", text: "Hi! I'm your X247 admin assistant. Ask me anything — try \"show top 5 partners\" or \"how many entries today\".", time: new Date() },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "n1", title: "New referral application", desc: "@rohan_marketer applied as a referral partner", time: "2m ago", type: "info", read: false },
    { id: "n2", title: "Contest milestone reached", desc: "iPhone 15 Pro contest crossed 1,000 entries", time: "18m ago", type: "success", read: false },
    { id: "n3", title: "Partner performance alert", desc: "Spotify clicks dropped 23% in last 24h", time: "1h ago", type: "warning", read: false },
    { id: "n4", title: "AI suggestion ready", desc: "3 new optimization recommendations available", time: "3h ago", type: "info", read: true },
    { id: "n5", title: "Weekly report generated", desc: "Last week: +12% engagement growth", time: "1d ago", type: "success", read: true },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Keyboard shortcuts: Cmd+K / Ctrl+K (palette), Cmd+/ (search), Esc (close panels) ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette(p => !p);
      } else if (meta && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        setShowAIPanel(false);
        setShowNotifPanel(false);
        setShowCommandPalette(false);
        setShowProfileMenu(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── AI assistant: simulated NLP response ──
  function handleAiSend(prompt?: string) {
    const text = (prompt ?? aiInput).trim();
    if (!text) return;
    setAiMessages(prev => [...prev, { role: "user", text, time: new Date() }]);
    setAiInput("");
    setAiThinking(true);
    setTimeout(() => {
      let response = "Got it. Working on that now.";
      const q = text.toLowerCase();
      if (q.includes("top") && q.includes("partner")) {
        const top = [...(data?.partners ?? [])].sort((a, b) => b.total.clicks - a.total.clicks).slice(0, 5);
        response = top.length
          ? `Top ${top.length} partners by clicks:\n${top.map((p, i) => `${i + 1}. ${p.partner.name} — ${p.total.clicks.toLocaleString()} clicks`).join("\n")}`
          : "No partner data available yet.";
      } else if (q.includes("inactive")) {
        const inactive = (data?.partners ?? []).filter(p => !p.partner.isActive);
        response = `Found ${inactive.length} inactive partner${inactive.length === 1 ? "" : "s"}${inactive.length ? ":\n" + inactive.slice(0, 5).map(p => `• ${p.partner.name}`).join("\n") : "."}`;
      } else if (q.includes("entries") || q.includes("today")) {
        response = `Total entries: ${entries.length.toLocaleString()}. Click the Entries tab for full details.`;
      } else if (q.includes("winner")) {
        response = `${winners.length} winner${winners.length === 1 ? "" : "s"} declared so far. Latest: ${winners[0]?.winnerName ?? "—"}.`;
      } else if (q.includes("report") || q.includes("export")) {
        response = "Report queued. Generating CSV export — you'll receive a notification when ready.";
      } else if (q.includes("optim") || q.includes("recommend") || q.includes("insight")) {
        response = "Here are my top 3 recommendations:\n1. Re-activate 3 dormant partners with >100 historical clicks\n2. Increase entry-points for the top-performing contest by 50%\n3. Send re-engagement email to 247 users who haven't entered in 7+ days";
      } else if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
        response = "Hey! Ask me about partners, entries, winners, contests, or request a report.";
      }
      setAiMessages(prev => [...prev, { role: "ai", text: response, time: new Date() }]);
      setAiThinking(false);
    }, 800);
  }

  function dismissNotif(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }
  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

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
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "partners", label: "Partners", icon: <Link2 className="w-4 h-4" />, count: data?.partners.length },
    { id: "contests", label: "Contests", icon: <Trophy className="w-4 h-4" />, count: contests.length },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "entries", label: "Entries", icon: <FileText className="w-4 h-4" />, count: entries.length || undefined },
    { id: "winners", label: "Winners", icon: <Award className="w-4 h-4" />, count: winners.length || undefined },
    { id: "referrals", label: "Referrals", icon: <Users className="w-4 h-4" />, count: referralApplications.filter(r => r.status === "pending").length || undefined },
  ];

  // ── Computed: data for overview charts ──
  const trendData = useMemo(() => {
    const clicks = genTrend(overview?.totalClicks ?? 0, 1);
    const impressions = genTrend(overview?.totalImpressions ?? 0, 4);
    const fills = genTrend(overview?.totalFormFills ?? 0, 7);
    return clicks.map((c, i) => ({
      day: `D${i + 1}`,
      clicks: c,
      impressions: impressions[i],
      fills: fills[i],
    }));
  }, [overview?.totalClicks, overview?.totalImpressions, overview?.totalFormFills]);

  const topPartnersData = useMemo(() => {
    return [...(data?.partners ?? [])]
      .sort((a, b) => b.total.clicks - a.total.clicks)
      .slice(0, 5)
      .map((p) => ({ name: (p.partner.name as string).length > 14 ? (p.partner.name as string).slice(0, 12) + "…" : p.partner.name, clicks: p.total.clicks, fills: p.total.formFills }));
  }, [data?.partners]);

  const distributionData = useMemo(() => {
    const total = (overview?.totalClicks ?? 0) + (overview?.totalImpressions ?? 0) + (overview?.totalFormFills ?? 0);
    if (total === 0) return [{ name: "No data", value: 1 }];
    return [
      { name: "Clicks", value: overview?.totalClicks ?? 0 },
      { name: "Impressions", value: overview?.totalImpressions ?? 0 },
      { name: "Form Fills", value: overview?.totalFormFills ?? 0 },
    ].filter(d => d.value > 0);
  }, [overview]);

  const aiInsights = useMemo(() => {
    const insights: { title: string; desc: string; tone: "good" | "warn" | "info"; action: string }[] = [];
    const totalP = data?.partners.length ?? 0;
    const activeP = overview?.activePartners ?? 0;
    const inactiveP = totalP - activeP;
    if (inactiveP > 0) insights.push({ title: `Re-activate ${inactiveP} dormant partner${inactiveP === 1 ? "" : "s"}`, desc: "These partners had previous engagement but are inactive now. Reactivating could boost monthly clicks by an estimated 15–25%.", tone: "warn", action: "View partners" });
    if ((overview?.totalFormFills ?? 0) > 0 && (overview?.totalClicks ?? 0) > 0) {
      const conv = ((overview!.totalFormFills / overview!.totalClicks) * 100).toFixed(1);
      insights.push({ title: `Conversion rate at ${conv}%`, desc: parseFloat(conv) > 5 ? "Excellent click-to-fill ratio — consider scaling top campaigns." : "Below industry average — try A/B testing your top 3 partner CTAs.", tone: parseFloat(conv) > 5 ? "good" : "info", action: "Open analytics" });
    }
    const pendingRefs = referralApplications.filter(r => r.status === "pending").length;
    if (pendingRefs > 0) insights.push({ title: `${pendingRefs} referral${pendingRefs === 1 ? "" : "s"} awaiting review`, desc: "Review pending referral partner applications to keep the affiliate funnel flowing.", tone: "info", action: "Review now" });
    if (insights.length < 3) insights.push({ title: "Schedule weekly digest", desc: "Auto-generate a Monday morning report covering KPIs, top partners and entry trends — sent to your inbox.", tone: "info", action: "Enable" });
    return insights.slice(0, 3);
  }, [data, overview, referralApplications]);

  // Recent activity (real data)
  const activityFeed = useMemo(() => {
    const items: { icon: React.ReactNode; title: string; desc: string; time: string; tone: string }[] = [];
    entries.slice(0, 4).forEach(e => items.push({ icon: <UserCheck className="w-3.5 h-3.5" />, title: "New entry", desc: `${e.fullName} · ${e.city}`, time: timeAgo(e.createdAt), tone: "rgba(255,255,255,0.5)" }));
    winners.slice(0, 2).forEach(w => items.push({ icon: <Trophy className="w-3.5 h-3.5" />, title: "Winner declared", desc: `${w.winnerName} won ${w.prize}`, time: timeAgo(w.announcedAt), tone: "rgba(255,255,255,0.7)" }));
    referralApplications.slice(0, 2).forEach(r => items.push({ icon: <Users className="w-3.5 h-3.5" />, title: "Referral application", desc: `${r.name} · ${r.status}`, time: r.status === "pending" ? "pending" : r.status, tone: "rgba(255,255,255,0.45)" }));
    return items.slice(0, 8);
  }, [entries, winners, referralApplications]);

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

      {/* ── ADVANCED TOP BAR ── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(4,4,4,0.92)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 h-16 px-3 sm:px-6 max-w-screen-2xl mx-auto">
          {/* Brand block */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
              <Shield className="w-4 h-4 text-white/85" />
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-[11px] text-white/35 font-display">
                <span className="text-white/75 font-medium tracking-wide">X247</span>
                <ChevronRight className="w-3 h-3" />
                <span className="capitalize">{activeTab}</span>
              </div>
              <div className="text-[9px] text-white/25 font-mono tracking-widest uppercase">Control Panel · Admin</div>
            </div>
            <div className="md:hidden text-sm font-display text-white/80">Admin</div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full ml-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-white/40 animate-ping" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-white/70" />
              </span>
              <span className="text-[9px] text-white/45 font-display uppercase tracking-widest">Live</span>
            </div>
          </div>

          {/* Global search (centre, grows) */}
          <div className="flex-1 max-w-xl mx-auto">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="hidden sm:flex w-full items-center gap-3 px-3.5 py-2 rounded-xl text-left transition-all hover:bg-white/[0.05]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <span className="flex-1 text-xs text-white/35 font-light">Search anything · partners, contests, entries…</span>
              <span className="flex items-center gap-1 text-[10px] text-white/30 font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <CommandIcon className="w-2.5 h-2.5" /> K
              </span>
            </button>
            <button
              onClick={() => setShowCommandPalette(true)}
              className="sm:hidden p-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Search className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Right cluster: AI · Notif · Refresh · Profile */}
          <div className="flex items-center gap-1.5 shrink-0">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => { setShowAIPanel(true); setShowNotifPanel(false); }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-display transition-all hover:bg-white/[0.08]"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
              title="AI Assistant"
              aria-label="Open AI Assistant"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden md:inline">AI Assistant</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => { setShowAIPanel(true); }}
              className="sm:hidden p-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              title="AI Assistant"
              aria-label="Open AI Assistant"
            >
              <Brain className="w-4 h-4 text-white/70" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => { setShowNotifPanel(true); setShowAIPanel(false); }}
              className="relative p-2 rounded-xl transition-all hover:bg-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              title="Notifications"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell className="w-4 h-4 text-white/55" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center text-[9px] font-display font-medium text-white" style={{ background: "rgba(255,255,255,0.95)", color: "#040404", boxShadow: "0 0 0 2px #040404" }}>
                  {unreadCount}
                </span>
              )}
            </motion.button>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl transition-all hover:bg-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-white/45 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(p => !p)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl transition-all hover:bg-white/[0.06]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-display font-medium text-white" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))" }}>
                  C
                </div>
                <span className="hidden lg:inline text-xs font-display text-white/65">CEO</span>
                <ChevronDown className={`w-3 h-3 text-white/35 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-60 rounded-2xl overflow-hidden z-50"
                    style={{ background: "rgba(8,8,8,0.95)", backdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6)" }}
                  >
                    <div className="p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-display font-medium text-white" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))" }}>C</div>
                        <div className="min-w-0">
                          <div className="text-sm font-display text-white/85 truncate">CEO</div>
                          <div className="text-[10px] text-white/40 font-mono truncate">ceo@x247.app</div>
                        </div>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-display uppercase tracking-widest text-white/60" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <Shield className="w-2.5 h-2.5" /> Super Admin
                      </div>
                    </div>
                    <div className="p-1.5">
                      {[
                        { icon: <Settings className="w-3.5 h-3.5" />, label: "Settings", action: () => {} },
                        { icon: <Database className="w-3.5 h-3.5" />, label: "API & Webhooks", action: () => {} },
                        { icon: <Lightbulb className="w-3.5 h-3.5" />, label: "Tips & Shortcuts", action: () => { setShowProfileMenu(false); setShowCommandPalette(true); } },
                      ].map(item => (
                        <button key={item.label} onClick={item.action} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-white/60 hover:text-white/90 hover:bg-white/[0.06] transition-all">
                          <span className="text-white/40">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t p-1.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-white/55 hover:text-red-400/80 hover:bg-red-500/[0.06] transition-all">
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

        {/* ── ANIMATED TAB NAVIGATION ── */}
        <div className="relative mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide rounded-2xl p-1.5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-display font-light whitespace-nowrap transition-colors flex-shrink-0 ${isActive ? "text-white" : "text-white/40 hover:text-white/70"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px -4px rgba(0,0,0,0.4)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className={`relative ${isActive ? "text-white/85" : "text-white/35"}`}>{tab.icon}</span>
                  <span className="relative">{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="relative min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-display" style={{ background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)", color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════ OVERVIEW TAB (AI Dashboard) ══════════════════════════════════════ */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {/* Greeting + quick AI prompt */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Sparkles className="w-3 h-3 text-white/60" />
                    <span className="text-[9px] font-display uppercase tracking-widest text-white/55">AI Dashboard</span>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-light text-white tracking-tight">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, CEO</h1>
                <p className="text-xs text-white/40 font-light mt-1">Here's what's happening across X247 today.</p>
              </div>
              <button onClick={() => setShowAIPanel(true)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-display transition-all hover:bg-white/[0.08] self-start lg:self-auto" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
                <Brain className="w-3.5 h-3.5" />
                Ask AI Assistant
                <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.5 rounded ml-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>⌘K</span>
              </button>
            </div>

            {/* Smart KPI cards with sparklines */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[
                { label: "Total Clicks", value: overview?.totalClicks ?? 0, icon: <MousePointer className="w-3.5 h-3.5" />, trend: genTrend(overview?.totalClicks ?? 0, 1), delta: 12.4, sub: "vs last week" },
                { label: "Impressions", value: overview?.totalImpressions ?? 0, icon: <Eye className="w-3.5 h-3.5" />, trend: genTrend(overview?.totalImpressions ?? 0, 4), delta: 8.7, sub: "vs last week" },
                { label: "Form Fills", value: overview?.totalFormFills ?? 0, icon: <FileText className="w-3.5 h-3.5" />, trend: genTrend(overview?.totalFormFills ?? 0, 7), delta: -3.2, sub: "vs last week" },
                { label: "Active Partners", value: overview?.activePartners ?? 0, icon: <Activity className="w-3.5 h-3.5" />, trend: genTrend(overview?.activePartners ?? 0, 3), delta: 0, sub: `of ${overview?.totalPartners ?? 0} total`, live: true },
              ].map((kpi, idx) => {
                const isPositive = kpi.delta > 0;
                const isNeutral = kpi.delta === 0;
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    className="relative rounded-2xl overflow-hidden group"
                    style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
                    <div className="absolute -top-12 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-700" style={{ background: "rgba(255,255,255,0.4)" }} />
                    <div className="relative p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <div className="text-white/55">{kpi.icon}</div>
                        </div>
                        {kpi.live && (
                          <span className="relative flex w-2 h-2">
                            <span className="absolute inline-flex w-full h-full rounded-full bg-white/40 animate-ping" />
                            <span className="relative w-2 h-2 rounded-full bg-white/70" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-display font-light text-white tracking-tight leading-none">{kpi.value.toLocaleString()}</span>
                        {!isNeutral && (
                          <span className={`flex items-center gap-0.5 text-[10px] font-display font-medium ${isPositive ? "text-white/70" : "text-white/45"}`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(kpi.delta)}%
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] font-display uppercase tracking-[0.18em] text-white/40">{kpi.label}</div>
                      <div className="text-[10px] text-white/25 font-light mt-0.5">{kpi.sub}</div>
                      <div className="mt-3 -mx-1 -mb-1">
                        <Sparkline data={kpi.trend} height={28} accent={isPositive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)"} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Trend area chart (clicks/impressions/fills) */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between p-4 sm:p-5 pb-2">
                  <div>
                    <div className="text-xs font-display text-white/80 mb-0.5">Engagement Trend</div>
                    <div className="text-[10px] text-white/35 font-light">Last 14 days · clicks · impressions · fills</div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-display">
                    <span className="flex items-center gap-1.5 text-white/55"><span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />Clicks</span>
                    <span className="hidden sm:flex items-center gap-1.5 text-white/45"><span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.45)" }} />Impressions</span>
                    <span className="hidden sm:flex items-center gap-1.5 text-white/35"><span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />Fills</span>
                  </div>
                </div>
                <div className="h-56 sm:h-64 px-2 pb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradImp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.18)" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.18)" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }} contentStyle={{ background: "rgba(8,8,8,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 11, fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.85)" }} labelStyle={{ color: "rgba(255,255,255,0.55)", fontSize: 10 }} />
                      <Area type="monotone" dataKey="impressions" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} fill="url(#gradImp)" />
                      <Area type="monotone" dataKey="clicks" stroke="rgba(255,255,255,0.85)" strokeWidth={1.8} fill="url(#gradClicks)" />
                      <Line type="monotone" dataKey="fills" stroke="rgba(255,255,255,0.55)" strokeWidth={1.4} dot={false} strokeDasharray="3 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Distribution donut */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="p-4 sm:p-5 pb-2">
                  <div className="text-xs font-display text-white/80 mb-0.5">Engagement Mix</div>
                  <div className="text-[10px] text-white/35 font-light">Distribution across signals</div>
                </div>
                <div className="h-56 sm:h-64 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="58%" outerRadius="82%" paddingAngle={3} stroke="rgba(4,4,4,0.9)" strokeWidth={2}>
                        {distributionData.map((_, i) => (
                          <Cell key={i} fill={["rgba(255,255,255,0.85)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.28)"][i] ?? "rgba(255,255,255,0.2)"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "rgba(8,8,8,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 11, color: "rgba(255,255,255,0.85)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-2xl font-display font-light text-white">{((overview?.totalClicks ?? 0) + (overview?.totalImpressions ?? 0) + (overview?.totalFormFills ?? 0)).toLocaleString()}</div>
                    <div className="text-[9px] font-display uppercase tracking-widest text-white/35">Total Signals</div>
                  </div>
                </div>
                <div className="px-4 pb-4 space-y-1.5">
                  {distributionData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-[10px] font-display">
                      <span className="flex items-center gap-2 text-white/55"><span className="w-2 h-2 rounded-full" style={{ background: ["rgba(255,255,255,0.85)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.28)"][i] }} />{d.name}</span>
                      <span className="text-white/40 tabular-nums">{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Top partners + AI Insights row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Top partners bar chart */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between p-4 sm:p-5 pb-2">
                  <div>
                    <div className="text-xs font-display text-white/80 mb-0.5">Top Partners</div>
                    <div className="text-[10px] text-white/35 font-light">By total clicks · this period</div>
                  </div>
                  <button onClick={() => setActiveTab("partners")} className="text-[10px] text-white/40 hover:text-white/70 font-display flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="h-56 sm:h-60 px-2 pb-3">
                  {topPartnersData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-white/30 font-light">No partner data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topPartnersData} layout="vertical" margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradBar" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
                          </linearGradient>
                        </defs>
                        <XAxis type="number" stroke="rgba(255,255,255,0.18)" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.18)" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }} axisLine={false} tickLine={false} width={90} />
                        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "rgba(8,8,8,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 11, color: "rgba(255,255,255,0.85)" }} />
                        <Bar dataKey="clicks" fill="url(#gradBar)" radius={[0, 6, 6, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>

              {/* AI Insights */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))", border: "1px solid rgba(255,255,255,0.09)" }}>
                <div className="p-4 sm:p-5 pb-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.16)" }}>
                    <Lightbulb className="w-3.5 h-3.5 text-white/75" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-display text-white/85">AI Insights</div>
                    <div className="text-[10px] text-white/35 font-light">Smart recommendations</div>
                  </div>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded text-white/50" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>BETA</span>
                </div>
                <div className="px-3 pb-3 space-y-2">
                  {aiInsights.map((ins, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} className="rounded-xl p-3 group hover:bg-white/[0.04] transition-all cursor-pointer" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: ins.tone === "good" ? "rgba(255,255,255,0.85)" : ins.tone === "warn" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.35)" }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-display text-white/85 leading-snug">{ins.title}</div>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 font-light leading-relaxed mb-2 pl-3.5">{ins.desc}</p>
                      <button className="ml-3.5 inline-flex items-center gap-1 text-[10px] font-display text-white/55 hover:text-white/85 transition-colors">
                        {ins.action} <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Activity timeline */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Activity className="w-3.5 h-3.5 text-white/65" />
                  </div>
                  <div>
                    <div className="text-xs font-display text-white/85">Live Activity</div>
                    <div className="text-[10px] text-white/35 font-light">Real-time platform events</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-display text-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
                  Streaming
                </div>
              </div>
              <div className="p-2">
                {activityFeed.length === 0 ? (
                  <div className="p-8 text-center text-xs text-white/30 font-light">No activity yet — check back soon</div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-[26px] top-3 bottom-3 w-px" style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
                    {activityFeed.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }} className="relative flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.025] transition-colors">
                        <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10" style={{ background: "rgba(8,8,8,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <div style={{ color: item.tone }}>{item.icon}</div>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-xs font-display text-white/80">{item.title}</span>
                            <span className="text-[10px] text-white/30 font-light truncate">· {item.desc}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-white/30 font-mono shrink-0 pt-1">{item.time}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

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

      {/* ══════════════════════════════════════ AI ASSISTANT SLIDE-OVER ══════════════════════════════════════ */}
      <AnimatePresence>
        {showAIPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAIPanel(false)} className="fixed inset-0 z-[60]" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-[61] w-full sm:w-[440px] flex flex-col"
              style={{ background: "rgba(8,8,8,0.96)", backdropFilter: "blur(28px)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.16)" }}>
                    <Brain className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <div className="text-sm font-display text-white/90">AI Assistant</div>
                    <div className="text-[10px] text-white/40 font-light flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                      Online · GPT-class
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowAIPanel(false)} aria-label="Close AI Assistant" className="p-2 rounded-xl hover:bg-white/[0.06] transition-all" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <X className="w-4 h-4 text-white/55" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))", border: "1px solid rgba(255,255,255,0.14)" }}>
                      <Sparkles className="w-6 h-6 text-white/65" />
                    </div>
                    <div className="text-sm font-display text-white/85 mb-1">How can I help today?</div>
                    <div className="text-[11px] text-white/40 font-light mb-5">Ask about your rewards data, partners, contests or get a quick summary.</div>
                    <div className="grid grid-cols-1 gap-2 w-full">
                      {[
                        { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Show me top performing partners" },
                        { icon: <FileText className="w-3.5 h-3.5" />, label: "Generate this week's report" },
                        { icon: <Lightbulb className="w-3.5 h-3.5" />, label: "Suggest optimisations" },
                        { icon: <Users className="w-3.5 h-3.5" />, label: "How many entries did we get?" },
                      ].map(s => (
                        <button key={s.label} onClick={() => { setAiInput(s.label); setTimeout(() => handleAiSend(), 80); }} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs text-white/65 hover:text-white/90 hover:bg-white/[0.05] transition-all" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className="text-white/45">{s.icon}</span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {aiMessages.map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: msg.role === "user" ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))", border: "1px solid rgba(255,255,255,0.1)" }}>
                          {msg.role === "user" ? <span className="text-[10px] font-display text-white/80">C</span> : <Brain className="w-3.5 h-3.5 text-white/70" />}
                        </div>
                        <div className={`flex-1 max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-light leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "text-white/85" : "text-white/75"}`} style={{ background: msg.role === "user" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                    {aiThinking && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <Brain className="w-3.5 h-3.5 text-white/70" />
                        </div>
                        <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/55 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/55 animate-bounce" style={{ animationDelay: "0.15s" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/55 animate-bounce" style={{ animationDelay: "0.3s" }} />
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <input
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiSend(); } }}
                    placeholder="Ask anything about your data…"
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 font-light focus:outline-none"
                  />
                  <button onClick={() => handleAiSend()} disabled={!aiInput.trim() || aiThinking} className="p-1.5 rounded-lg transition-all disabled:opacity-30" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.14)" }}>
                    <Send className="w-3.5 h-3.5 text-white/80" />
                  </button>
                </div>
                <div className="text-[9px] text-white/25 font-mono text-center mt-2 uppercase tracking-widest">AI may produce inaccurate info · always verify</div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════ NOTIFICATION CENTER SLIDE-OVER ══════════════════════════════════════ */}
      <AnimatePresence>
        {showNotifPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotifPanel(false)} className="fixed inset-0 z-[60]" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-[61] w-full sm:w-[400px] flex flex-col"
              style={{ background: "rgba(8,8,8,0.96)", backdropFilter: "blur(28px)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Bell className="w-4 h-4 text-white/75" />
                    {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white" style={{ boxShadow: "0 0 0 2px #080808" }} />}
                  </div>
                  <div>
                    <div className="text-sm font-display text-white/90">Notifications</div>
                    <div className="text-[10px] text-white/40 font-light">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] font-display text-white/55 hover:text-white/85 px-2 py-1 rounded-lg transition-colors">Mark all read</button>
                  )}
                  <button onClick={() => setShowNotifPanel(false)} aria-label="Close notifications" className="p-2 rounded-xl hover:bg-white/[0.06] transition-all" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                    <X className="w-4 h-4 text-white/55" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <CheckCircle2 className="w-10 h-10 text-white/25 mb-3" />
                    <div className="text-sm font-display text-white/55">No notifications</div>
                    <div className="text-[11px] text-white/30 font-light mt-1">You're all caught up</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map(n => (
                      <motion.div key={n.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="relative group rounded-xl p-3 hover:bg-white/[0.04] transition-all cursor-pointer" style={{ background: n.read ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.04)", border: `1px solid ${n.read ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}` }}>
                        {!n.read && <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white/85" />}
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {n.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5 text-white/65" /> : n.type === "warning" ? <AlertCircle className="w-3.5 h-3.5 text-white/65" /> : n.type === "ai" ? <Brain className="w-3.5 h-3.5 text-white/65" /> : <Bell className="w-3.5 h-3.5 text-white/65" />}
                          </div>
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="text-xs font-display text-white/85 mb-0.5">{n.title}</div>
                            <div className="text-[11px] text-white/45 font-light leading-snug">{n.desc}</div>
                            <div className="text-[10px] text-white/30 font-mono mt-1.5">{n.time}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); dismissNotif(n.id); }} className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/[0.08] transition-all">
                            <X className="w-3 h-3 text-white/40" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════ COMMAND PALETTE (⌘K) ══════════════════════════════════════ */}
      <AnimatePresence>
        {showCommandPalette && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommandPalette(false)} className="fixed inset-0 z-[70]" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }} />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed left-1/2 -translate-x-1/2 top-[15vh] z-[71] w-[92vw] max-w-xl rounded-2xl overflow-hidden"
              style={{ background: "rgba(10,10,10,0.96)", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 32px 64px -16px rgba(0,0,0,0.7)" }}
            >
              <CommandPrimitive className="bg-transparent">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <Search className="w-4 h-4 text-white/45 shrink-0" />
                  <CommandPrimitive.Input
                    placeholder="Search commands, navigate, or ask AI…"
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/35 font-light focus:outline-none"
                  />
                  <span className="text-[10px] text-white/35 font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>ESC</span>
                </div>
                <CommandPrimitive.List className="max-h-[400px] overflow-y-auto p-2">
                  <CommandPrimitive.Empty className="py-8 text-center text-xs text-white/35 font-light">No results found</CommandPrimitive.Empty>

                  <CommandPrimitive.Group heading="Navigate" className="text-[9px] font-display uppercase tracking-widest text-white/30 px-2 py-1.5">
                    {tabs.map(tab => (
                      <CommandPrimitive.Item
                        key={tab.id}
                        value={`navigate ${tab.label}`}
                        onSelect={() => { setActiveTab(tab.id); setShowCommandPalette(false); }}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-white/65 cursor-pointer aria-selected:bg-white/[0.06] aria-selected:text-white/95 transition-all"
                      >
                        <span className="text-white/45">{tab.icon}</span>
                        <span className="flex-1">Go to {tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && <span className="text-[10px] text-white/35 font-mono">{tab.count}</span>}
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>

                  <CommandPrimitive.Group heading="Actions" className="text-[9px] font-display uppercase tracking-widest text-white/30 px-2 py-1.5 mt-2">
                    <CommandPrimitive.Item value="ai assistant ask" onSelect={() => { setShowCommandPalette(false); setShowAIPanel(true); }} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-white/65 cursor-pointer aria-selected:bg-white/[0.06] aria-selected:text-white/95 transition-all">
                      <Brain className="w-3.5 h-3.5 text-white/45" />
                      <span className="flex-1">Open AI Assistant</span>
                      <span className="text-[10px] text-white/30 font-mono">⌘K</span>
                    </CommandPrimitive.Item>
                    <CommandPrimitive.Item value="notifications bell" onSelect={() => { setShowCommandPalette(false); setShowNotifPanel(true); }} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-white/65 cursor-pointer aria-selected:bg-white/[0.06] aria-selected:text-white/95 transition-all">
                      <Bell className="w-3.5 h-3.5 text-white/45" />
                      <span className="flex-1">View Notifications</span>
                      {unreadCount > 0 && <span className="text-[10px] text-white/45 font-mono">{unreadCount}</span>}
                    </CommandPrimitive.Item>
                    <CommandPrimitive.Item value="refresh data sync" onSelect={() => { setShowCommandPalette(false); handleRefresh(); }} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-white/65 cursor-pointer aria-selected:bg-white/[0.06] aria-selected:text-white/95 transition-all">
                      <RefreshCw className="w-3.5 h-3.5 text-white/45" />
                      <span className="flex-1">Refresh all data</span>
                    </CommandPrimitive.Item>
                  </CommandPrimitive.Group>

                  <CommandPrimitive.Group heading="Quick AI Prompts" className="text-[9px] font-display uppercase tracking-widest text-white/30 px-2 py-1.5 mt-2">
                    {[
                      "Show top performing partners",
                      "Generate weekly report",
                      "How many active partners do we have?",
                      "Suggest optimisations for low performers",
                    ].map(p => (
                      <CommandPrimitive.Item
                        key={p}
                        value={`ai ${p}`}
                        onSelect={() => { setShowCommandPalette(false); setShowAIPanel(true); setAiInput(p); setTimeout(() => handleAiSend(), 120); }}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-white/65 cursor-pointer aria-selected:bg-white/[0.06] aria-selected:text-white/95 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white/45" />
                        <span className="flex-1 truncate">{p}</span>
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>
                </CommandPrimitive.List>
                <div className="flex items-center justify-between px-4 py-2.5 border-t text-[10px] text-white/35 font-display" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="font-mono text-[9px] px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>↵</span> Open</span>
                    <span className="flex items-center gap-1"><span className="font-mono text-[9px] px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>↑↓</span> Navigate</span>
                  </div>
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> X247 Command</span>
                </div>
              </CommandPrimitive>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
