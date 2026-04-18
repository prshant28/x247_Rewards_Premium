import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Sparkles, ArrowRight,
  Bot, User, Loader2, ChevronRight, Clock, Trash2, Plus,
  History, Zap, RotateCcw, Copy, Check,
  Mic, MicOff, Volume2, VolumeX, Waves,
  AlertCircle, Tag, Star, TrendingUp, Gift,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SavedConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface PartnerCard {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  badge?: string;
  badgeSecondary?: string;
  accent: string;
}

type VoiceStatus = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

function parsePartnerCards(content: string): { text: string; cards: PartnerCard[] } {
  const cards: PartnerCard[] = [];
  const text = content.replace(/```partner-card\n([\s\S]*?)```/g, (_, json) => {
    try {
      const card = JSON.parse(json.trim());
      cards.push(card);
      return "";
    } catch {
      return "";
    }
  });
  // Strip raw URLs (http/https) from text
  const cleanedText = text.replace(/https?:\/\/[^\s)>\]"]+/g, "").replace(/\s{2,}/g, " ").trim();
  return { text: cleanedText, cards };
}

function cleanTextForTTS(content: string): string {
  let text = content;
  text = text.replace(/```partner-card[\s\S]*?```/g, "");
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/https?:\/\/[^\s)>\]"]+/g, "");
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^[-*]\s+/gm, "");
  text = text.replace(/^\d+\.\s+/gm, "");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim().slice(0, 800);
}

function formatMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    let processed: React.ReactNode = line;

    if (line.startsWith("### ")) {
      processed = <h4 key={i} className="text-xs font-display font-medium text-white/75 mt-3 mb-1.5 tracking-wide">{line.slice(4)}</h4>;
    } else if (line.startsWith("## ")) {
      processed = <h3 key={i} className="text-sm font-display font-medium text-white/80 mt-3 mb-1.5 tracking-wide">{line.slice(3)}</h3>;
    } else if (line.startsWith("# ")) {
      processed = <h2 key={i} className="text-sm font-display font-semibold text-white/90 mt-3 mb-1.5">{line.slice(2)}</h2>;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      processed = (
        <div key={i} className="flex gap-2 pl-1 mb-1">
          <span className="text-white/25 mt-[5px] shrink-0 text-[10px]">◆</span>
          <span>{renderInlineMarkdown(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        processed = (
          <div key={i} className="flex gap-2 pl-1 mb-1">
            <span className="text-white/30 font-medium text-[11px] mt-px min-w-[16px] shrink-0">{match[1]}.</span>
            <span>{renderInlineMarkdown(match[2])}</span>
          </div>
        );
      }
    } else {
      processed = <span key={i}>{renderInlineMarkdown(line)}</span>;
    }

    if (typeof processed === "string" || (React.isValidElement(processed) && processed.type === "span")) {
      nodes.push(<React.Fragment key={i}>{processed}{i < lines.length - 1 ? "\n" : ""}</React.Fragment>);
    } else {
      nodes.push(processed);
    }
  });

  return nodes;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<React.Fragment key={key++}>{remaining.slice(0, boldMatch.index)}</React.Fragment>);
      }
      parts.push(<strong key={key++} className="font-semibold text-white/90">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  finance: <TrendingUp className="w-3 h-3" />,
  shopping: <Tag className="w-3 h-3" />,
  rewards: <Gift className="w-3 h-3" />,
  premium: <Star className="w-3 h-3" />,
  default: <Sparkles className="w-3 h-3" />,
};

function getCategoryIcon(cat: string) {
  const lower = cat.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

function PartnerCardPreview({ card, onNavigate }: { card: PartnerCard; onNavigate: (slug: string) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mt-3 mb-1 cursor-pointer select-none"
      onClick={() => onNavigate(card.slug)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden rounded-2xl transition-all duration-300"
        style={{
          background: hovered
            ? "linear-gradient(135deg, rgba(30,30,36,0.98) 0%, rgba(20,20,25,0.98) 100%)"
            : "linear-gradient(135deg, rgba(22,22,28,0.97) 0%, rgba(14,14,18,0.97) 100%)",
          border: hovered ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.07)",
          boxShadow: hovered
            ? "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)"
            : "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Shimmer line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-300"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.08) 60%, transparent 100%)",
            opacity: hovered ? 1 : 0.5,
          }}
        />

        <div className="p-4">
          {/* Category + badges */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.07]">
              <span className="text-white/30">{getCategoryIcon(card.category)}</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-white/30 font-display">{card.category}</span>
            </div>
            {card.badge && (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.1] text-[9px] text-white/50 font-display tracking-wide">{card.badge}</span>
            )}
            {card.badgeSecondary && (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-[9px] text-white/35 font-display tracking-wide">{card.badgeSecondary}</span>
            )}
          </div>

          {/* Name */}
          <h4 className="text-[15px] font-display font-light text-white/90 tracking-wide mb-1 leading-tight">{card.name}</h4>

          {/* Tagline */}
          {card.tagline && (
            <p className="text-[12px] text-white/38 font-light leading-snug mb-3">{card.tagline}</p>
          )}

          {/* CTA row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                style={{ background: hovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}
              />
              <span className="text-[10px] text-white/30 font-display tracking-wide">Partner Offer</span>
            </div>
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300"
              style={{
                background: hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                border: hovered ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.07)",
              }}
              animate={hovered ? { x: 0 } : { x: 0 }}
            >
              <span className="text-[10px] font-display text-white/60 tracking-wide">View Offer</span>
              <motion.div animate={{ x: hovered ? 2 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="w-3 h-3 text-white/50" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const SUGGESTIONS = [
  { text: "How do I earn entries?", icon: <Zap className="w-3.5 h-3.5" />, desc: "Learn the entry system" },
  { text: "Tell me about available partners", icon: <Tag className="w-3.5 h-3.5" />, desc: "Explore partner offers" },
  { text: "What are the rules?", icon: <Sparkles className="w-3.5 h-3.5" />, desc: "Platform guidelines" },
  { text: "How does the prize draw work?", icon: <Gift className="w-3.5 h-3.5" />, desc: "Daily draw mechanics" },
];

const STORAGE_KEY = "x247-chat-history";
const MAX_SAVED_CHATS = 20;

function loadConversations(): SavedConversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveConversations(convos: SavedConversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convos.slice(0, MAX_SAVED_CHATS)));
  } catch {}
}

function generateTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find(m => m.role === "user");
  if (!firstUserMsg) return "New Chat";
  const text = firstUserMsg.content;
  return text.length > 40 ? text.slice(0, 40) + "…" : text;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function VoiceOrb({ status }: { status: VoiceStatus }) {
  const isActive = status !== "idle";
  return (
    <div className="relative flex items-center justify-center w-44 h-44">
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full border border-white/[0.06]"
            animate={{ width: [140, 180, 140], height: [140, 180, 140], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: status === "speaking" ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full border border-white/[0.04]"
            animate={{ width: [140, 200, 140], height: [140, 200, 140], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: status === "speaking" ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </>
      )}
      <motion.div
        className="w-36 h-36 rounded-full flex items-center justify-center relative overflow-hidden"
        style={{
          background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: isActive ? "0 0 50px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
        }}
        animate={isActive ? { scale: [1, 1.03, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 40% 20%, rgba(255,255,255,0.04), transparent 60%)" }} />
        {status === "listening" && <Mic className="w-10 h-10 text-white/60 relative z-10" />}
        {status === "transcribing" && <Loader2 className="w-10 h-10 text-white/40 animate-spin relative z-10" />}
        {status === "thinking" && (
          <div className="flex gap-1.5 relative z-10">
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-white/35" animate={{ y: [0, -7, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay }} />
            ))}
          </div>
        )}
        {status === "speaking" && <Waves className="w-10 h-10 text-white/50 relative z-10" />}
        {status === "idle" && <Mic className="w-10 h-10 text-white/25 relative z-10" />}
      </motion.div>
    </div>
  );
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamContent, setCurrentStreamContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useLocation();
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [msgCount, setMsgCount] = useState(0);

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [voiceLastResponse, setVoiceLastResponse] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  useEffect(() => { setConversations(loadConversations()); }, []);

  useEffect(() => {
    if (messages.length === 0 && isOpen && activeTab === "chat") {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Hey! I'm the **X247 AI Assistant**. Ask me anything about the platform, partners, how to earn entries, or registration details.\n\nHow can I help you today?",
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStreamContent]);

  useEffect(() => {
    if (isOpen && inputRef.current && activeTab === "chat") {
      inputRef.current.focus();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    const realMessages = messages.filter(m => m.id !== "welcome");
    if (realMessages.length >= 2 && !isStreaming) {
      const id = currentConvoId || `chat-${Date.now()}`;
      const existing = conversations.find(c => c.id === id);
      const convo: SavedConversation = {
        id,
        title: generateTitle(realMessages),
        messages: realMessages,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [convo, ...conversations.filter(c => c.id !== id)];
      setConversations(updated);
      saveConversations(updated);
      if (!currentConvoId) setCurrentConvoId(id);
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    };
  }, []);

  const getPageContext = useCallback(() => {
    if (location.includes("/partners/")) return `Partner Detail page for: ${location.split("/partners/")[1]}`;
    if (location === "/partners") return "Partners listing page";
    if (location === "/offers") return "Offers page";
    if (location === "/giveaway") return "Giveaway entry page";
    if (location === "/") return "Home page";
    return location;
  }, [location]);

  const handleNavigate = useCallback((slug: string) => {
    setLocation(`/partners/${slug}`);
    setIsOpen(false);
  }, [setLocation]);

  function startNewChat() {
    setMessages([]);
    setCurrentConvoId(null);
    setCurrentStreamContent("");
    setActiveTab("chat");
    setMsgCount(0);
  }

  function loadConversation(convo: SavedConversation) {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hey! I'm the **X247 AI Assistant**. Ask me anything about the platform, partners, how to earn entries, or registration details.\n\nHow can I help you today?",
        timestamp: new Date(),
      },
      ...convo.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
    ]);
    setCurrentConvoId(convo.id);
    setActiveTab("chat");
    setMsgCount(convo.messages.filter(m => m.role === "user").length);
  }

  function deleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    saveConversations(updated);
    if (currentConvoId === id) startNewChat();
  }

  function clearAllHistory() {
    setConversations([]);
    saveConversations([]);
    startNewChat();
  }

  function copyMessage(content: string, id: string) {
    const { text } = parsePartnerCards(content);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function stopSpeaking() {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }
    setVoiceStatus(prev => prev === "speaking" ? "idle" : prev);
  }

  async function speakText(text: string) {
    if (!ttsEnabled) return;
    try {
      stopSpeaking();
      const cleanText = cleanTextForTTS(text);
      if (!cleanText.trim()) return;
      setVoiceStatus("speaking");
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });
      if (!res.ok) { setVoiceStatus("idle"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); currentAudioRef.current = null; setVoiceStatus("idle"); };
      audio.onerror = () => { URL.revokeObjectURL(url); currentAudioRef.current = null; setVoiceStatus("idle"); };
      await audio.play();
    } catch {
      setVoiceStatus("idle");
    }
  }

  async function handleSend(messageText?: string, fromVoice = false) {
    const text = (messageText || input).trim();
    if (!text || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setCurrentStreamContent("");
    setMsgCount(c => c + 1);
    if (fromVoice) setVoiceStatus("thinking");

    const chatHistory = [...messages.filter(m => m.id !== "welcome"), userMessage].map(m => ({ role: m.role, content: m.content }));
    const abort = new AbortController();
    streamAbortRef.current = abort;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory, currentPage: getPageContext() }),
        signal: abort.signal,
      });

      if (!response.ok) throw new Error("Chat request failed");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) { fullContent += data.content; setCurrentStreamContent(fullContent); }
            } catch {}
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentStreamContent("");
      if (!isOpen) setHasNewMessage(true);
      if (isVoiceMode || ttsEnabled) {
        setVoiceLastResponse(cleanTextForTTS(fullContent));
        await speakText(fullContent);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
      setCurrentStreamContent("");
      if (fromVoice) setVoiceStatus("idle");
    }

    setIsStreaming(false);
    if (fromVoice && voiceStatus === "thinking") setVoiceStatus("idle");
  }

  async function startRecording() {
    setVoiceError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 500) { setVoiceStatus("idle"); setIsRecording(false); return; }
        await transcribeAudio(blob, mimeType);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setVoiceStatus("listening");
      setVoiceTranscript("");
    } catch {
      setVoiceError("Microphone access denied. Please allow mic permission.");
      setVoiceStatus("idle");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setIsRecording(false);
  }

  async function transcribeAudio(blob: Blob, mimeType: string) {
    setVoiceStatus("transcribing");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("/api/voice/stt", { method: "POST", body: formData });
      if (!res.ok) throw new Error("STT failed");
      const data = await res.json() as { transcript: string };
      const transcript = data.transcript?.trim();
      if (!transcript) { setVoiceStatus("idle"); setVoiceError("Couldn't understand that. Please try again."); return; }
      setVoiceTranscript(transcript);
      setInput(transcript);
      await handleSend(transcript, isVoiceMode);
    } catch {
      setVoiceError("Transcription failed. Please try again.");
      setVoiceStatus("idle");
    }
  }

  function getSupportedMimeType(): string {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
    for (const type of types) { if (MediaRecorder.isTypeSupported(type)) return type; }
    return "";
  }

  function toggleRecording() {
    if (isRecording) stopRecording();
    else { stopSpeaking(); startRecording(); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function renderMessageContent(content: string) {
    const { text, cards } = parsePartnerCards(content);
    return (
      <>
        {text && <div className="whitespace-pre-wrap text-[13px] leading-relaxed">{formatMarkdown(text)}</div>}
        {cards.length > 0 && (
          <div className="space-y-0.5">
            {cards.map((card, i) => (
              <PartnerCardPreview key={`${card.slug}-${i}`} card={card} onNavigate={handleNavigate} />
            ))}
          </div>
        )}
      </>
    );
  }

  const realMsgCount = messages.filter(m => m.id !== "welcome").length;

  const voiceStatusLabel: Record<VoiceStatus, string> = {
    idle: "Tap mic to speak",
    listening: "Listening…",
    transcribing: "Processing…",
    thinking: "Thinking…",
    speaking: "Speaking…",
  };

  return (
    <>
      {/* ── Voice Mode Overlay ── */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex flex-col"
            style={{ background: "rgba(4, 4, 6, 0.98)", backdropFilter: "blur(40px)" }}
          >
            <div className="noise-overlay opacity-50" />
            <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <Waves className="w-4 h-4 text-white/50" />
                </div>
                <div>
                  <p className="text-[11px] font-display font-medium text-white/60 uppercase tracking-[0.15em]">Voice Mode</p>
                  <p className="text-[10px] text-white/25 font-light">X247 AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTtsEnabled(e => !e)}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${ttsEnabled ? "bg-white/[0.08] border-white/[0.12] text-white/60" : "bg-white/[0.03] border-white/[0.06] text-white/25"}`}
                >
                  {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setIsVoiceMode(false); stopSpeaking(); if (isRecording) stopRecording(); }}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-6">
              <VoiceOrb status={voiceStatus} />
              <div className="text-center space-y-2">
                <p className="text-[11px] font-display uppercase tracking-[0.2em] text-white/30">{voiceStatusLabel[voiceStatus]}</p>
                {voiceTranscript && voiceStatus !== "idle" && (
                  <p className="text-sm text-white/50 font-light max-w-xs text-center leading-relaxed">"{voiceTranscript}"</p>
                )}
                {voiceError && (
                  <p className="text-[11px] text-white/40 font-light flex items-center gap-1 justify-center">
                    <AlertCircle className="w-3 h-3" />{voiceError}
                  </p>
                )}
              </div>
              {voiceLastResponse && voiceStatus === "idle" && (
                <div className="max-w-sm w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[11px] text-white/25 uppercase tracking-widest font-display mb-1.5">Last response</p>
                  <p className="text-[12px] text-white/50 font-light leading-relaxed line-clamp-3">{voiceLastResponse}</p>
                </div>
              )}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4 px-6 pb-12">
              {voiceStatus === "speaking" && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/50 text-[11px] font-display hover:bg-white/[0.1] transition-all"
                >
                  <VolumeX className="w-3 h-3" />Stop Speaking
                </button>
              )}
              <motion.button
                onClick={toggleRecording}
                disabled={voiceStatus === "transcribing" || voiceStatus === "thinking"}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: isRecording
                    ? "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.14), rgba(255,255,255,0.06))"
                    : "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
                  border: `1px solid ${isRecording ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}`,
                  boxShadow: isRecording ? "0 0 30px rgba(255,255,255,0.08)" : "none",
                }}
              >
                {isRecording && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                {isRecording ? <MicOff className="w-7 h-7 text-white/80" /> : <Mic className="w-7 h-7 text-white/50" />}
              </motion.button>
              <p className="text-[10px] text-white/20 font-light">{isRecording ? "Tap to stop" : "Tap to speak"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 24, scale: 0.94, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.85 }}
            className="fixed bottom-[92px] right-4 sm:right-6 z-[60] w-[calc(100vw-32px)] sm:w-[440px] max-h-[82vh] flex flex-col"
            style={{
              background: "rgba(6, 6, 9, 0.99)",
              backdropFilter: "blur(80px)",
              WebkitBackdropFilter: "blur(80px)",
              borderRadius: "28px",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 40px 120px rgba(0,0,0,0.95), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Ambient glow decoration */}
            <div className="absolute top-0 left-0 right-0 h-40 rounded-t-[28px] pointer-events-none overflow-hidden">
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 25% 0%, rgba(255,255,255,0.022) 0%, transparent 70%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 35% at 80% 10%, rgba(255,255,255,0.012) 0%, transparent 60%)" }} />
            </div>

            {/* ── Header ── */}
            <div className="shrink-0 relative z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)", borderRadius: "26px 26px 0 0" }}>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden"
                      style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
                    >
                      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.06), transparent 60%)" }} />
                      <Sparkles className="w-4.5 h-4.5 text-white/65 relative z-10" />
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#060609]"
                      style={{ background: isStreaming ? "rgba(255,255,255,0.5)" : "rgba(100,200,120,0.85)" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-display font-light text-white/90 tracking-widest">X247 ASSISTANT</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <motion.span
                        className="text-[10px] text-white/35 font-light"
                        animate={isStreaming ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                        transition={{ duration: 1.2, repeat: isStreaming ? Infinity : 0 }}
                      >
                        {isStreaming ? "Thinking…" : "Online · GPT-4o"}
                      </motion.span>
                      {msgCount > 0 && (
                        <>
                          <span className="text-[8px] text-white/10">·</span>
                          <span className="text-[10px] text-white/20 font-light">{msgCount} msg{msgCount !== 1 ? "s" : ""}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {[
                    { icon: ttsEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />, action: () => setTtsEnabled(e => !e), active: ttsEnabled, title: "Toggle voice" },
                    { icon: <Mic className="w-3 h-3" />, action: () => { setIsVoiceMode(true); setIsOpen(false); }, active: false, title: "Voice mode" },
                    { icon: <Plus className="w-3 h-3" />, action: startNewChat, active: false, title: "New chat" },
                    { icon: <X className="w-3.5 h-3.5" />, action: () => setIsOpen(false), active: false, title: "Close" },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.action}
                      title={btn.title}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${btn.active ? "bg-white/[0.08] border-white/[0.12] text-white/60" : "bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.07] hover:border-white/[0.1]"}`}
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex px-5 pb-0 gap-0.5">
                {(["chat", "history"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2.5 text-[11px] font-display font-light rounded-t-lg transition-all relative ${activeTab === tab ? "text-white/75" : "text-white/25 hover:text-white/45"}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {tab === "chat" ? <MessageCircle className="w-3 h-3" /> : <History className="w-3 h-3" />}
                      <span className="uppercase tracking-widest text-[10px]">{tab === "chat" ? "Chat" : "Recent"}</span>
                      {tab === "history" && conversations.length > 0 && (
                        <span className="px-1.5 py-0 rounded-full bg-white/[0.07] text-[9px] text-white/35 border border-white/[0.08]">{conversations.length}</span>
                      )}
                    </span>
                    {activeTab === tab && (
                      <motion.div layoutId="chatTabIndicator" className="absolute bottom-0 left-2 right-2 h-px rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Body ── */}
            <AnimatePresence mode="wait">
              {activeTab === "chat" ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  {/* Messages */}
                  <div
                    className="flex-1 overflow-y-auto px-4 py-5 space-y-5 min-h-0"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}
                  >
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className={`flex gap-3 group ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${msg.role === "user" ? "bg-white/[0.08] border border-white/[0.12]" : "bg-white/[0.04] border border-white/[0.07]"}`}
                          style={msg.role === "assistant" ? { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" } : {}}
                        >
                          {msg.role === "user" ? <User className="w-3 h-3 text-white/50" /> : <Bot className="w-3 h-3 text-white/40" />}
                        </div>

                        {/* Bubble */}
                        <div className="relative max-w-[84%]">
                          {msg.role === "user" ? (
                            <div
                              className="rounded-2xl rounded-tr-sm px-4 py-3"
                              style={{
                                background: "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.05))",
                                border: "1px solid rgba(255,255,255,0.1)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                              }}
                            >
                              <p className="text-[13px] text-white/85 font-light leading-relaxed">{msg.content}</p>
                            </div>
                          ) : (
                            <div className="text-white/65">
                              {renderMessageContent(msg.content)}
                            </div>
                          )}

                          {/* Actions on hover */}
                          {msg.id !== "welcome" && msg.role === "assistant" && (
                            <div className="absolute -bottom-6 left-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => speakText(msg.content)}
                                className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/20 hover:text-white/50 hover:bg-white/[0.07] transition-all"
                                title="Read aloud"
                              >
                                <Volume2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => copyMessage(msg.content, msg.id)}
                                className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/20 hover:text-white/50 hover:bg-white/[0.07] transition-all"
                                title="Copy message"
                              >
                                {copiedId === msg.id ? <Check className="w-2.5 h-2.5 text-white/60" /> : <Copy className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Streaming bubble */}
                    {isStreaming && currentStreamContent && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                        <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5 bg-white/[0.04] border border-white/[0.07]">
                          <Bot className="w-3 h-3 text-white/40" />
                        </div>
                        <div className="max-w-[84%] text-white/65">
                          {renderMessageContent(currentStreamContent)}
                          <motion.span
                            className="inline-block w-[2px] h-[14px] bg-white/35 ml-0.5 rounded-sm align-text-bottom"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.65, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Thinking indicator */}
                    {isStreaming && !currentStreamContent && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                        <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5 bg-white/[0.04] border border-white/[0.07] relative overflow-hidden">
                          <motion.div
                            className="absolute inset-0 rounded-xl"
                            animate={{ opacity: [0, 0.4, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent)" }}
                          />
                          <Sparkles className="w-3 h-3 text-white/40 relative z-10" />
                        </div>
                        <div
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-sm"
                          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex gap-1 items-center">
                            {[0, 0.12, 0.24].map((delay, i) => (
                              <motion.div
                                key={i}
                                className="rounded-full bg-white/30"
                                animate={{ scaleY: [0.5, 1.4, 0.5], opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut", delay }}
                                style={{ width: "3px", height: "12px" }}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-white/20 font-light tracking-widest uppercase">Thinking</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Quick suggestions */}
                    {messages.length <= 1 && !isStreaming && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="pt-1 space-y-2"
                      >
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/15 font-display px-1 mb-3">Quick Questions</p>
                        <div className="grid grid-cols-1 gap-2">
                          {SUGGESTIONS.map((s, i) => (
                            <motion.button
                              key={s.text}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.25 + i * 0.06, duration: 0.3 }}
                              onClick={() => handleSend(s.text)}
                              className="group text-left px-4 py-3 rounded-2xl transition-all duration-200 relative overflow-hidden"
                              style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))",
                                border: "1px solid rgba(255,255,255,0.05)",
                              }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))" }} />
                              <div className="relative flex items-center gap-3">
                                <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/25 group-hover:text-white/50 group-hover:border-white/[0.12] transition-all shrink-0">
                                  {s.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] text-white/55 font-light group-hover:text-white/75 transition-colors">{s.text}</p>
                                  <p className="text-[10px] text-white/20 font-light mt-0.5">{s.desc}</p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-all group-hover:translate-x-0.5 shrink-0" />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} className="h-1" />
                  </div>

                  {/* ── Input Area ── */}
                  <div className="shrink-0 px-4 pb-4 pt-2">
                    {voiceError && (
                      <div className="flex items-center gap-2 px-3 py-2 mb-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/35">
                        <AlertCircle className="w-3 h-3 shrink-0 text-white/30" />{voiceError}
                      </div>
                    )}

                    <div
                      className="flex items-center gap-2 rounded-2xl px-3.5 py-3 transition-all duration-200 focus-within:border-white/[0.13]"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? "Listening…" : "Ask anything about X247…"}
                        disabled={isStreaming || isRecording}
                        className="flex-1 bg-transparent text-white/85 text-[13px] font-light placeholder-white/18 outline-none disabled:opacity-40 min-w-0"
                      />

                      {/* Mic button */}
                      <motion.button
                        onClick={toggleRecording}
                        disabled={isStreaming || voiceStatus === "transcribing"}
                        whileTap={{ scale: 0.88 }}
                        className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0 disabled:opacity-30 ${isRecording ? "bg-white/[0.1] border-white/[0.2] text-white/75" : "bg-transparent border-white/[0.06] text-white/25 hover:text-white/55 hover:border-white/[0.1]"}`}
                      >
                        <AnimatePresence mode="wait">
                          {isRecording ? (
                            <motion.div key="stop" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                              {voiceStatus === "transcribing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MicOff className="w-3.5 h-3.5" />}
                            </motion.div>
                          ) : (
                            <motion.div key="mic" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                              <Mic className="w-3.5 h-3.5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {isRecording && (
                          <motion.div
                            className="absolute inset-0 rounded-xl border border-white/25"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        )}
                      </motion.button>

                      {/* Send button */}
                      <motion.button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isStreaming}
                        whileTap={{ scale: 0.88 }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-20 disabled:cursor-not-allowed"
                        style={{
                          background: input.trim() && !isStreaming ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                          border: input.trim() && !isStreaming ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <Send className="w-3.5 h-3.5 text-white/60" />
                      </motion.button>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 px-0.5">
                      <p className="text-[9px] text-white/12 font-light tracking-wide uppercase">Powered by X247 AI</p>
                      <div className="flex items-center gap-2">
                        {realMsgCount > 0 && (
                          <button onClick={startNewChat} className="flex items-center gap-1 text-[9px] text-white/15 hover:text-white/35 transition-colors">
                            <RotateCcw className="w-2.5 h-2.5" />New
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTab("history")}
                          className="flex items-center gap-1 text-[9px] text-white/15 hover:text-white/35 transition-colors"
                        >
                          <History className="w-2.5 h-2.5" />History
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ── History Tab ── */
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-display">{conversations.length} Conversation{conversations.length !== 1 ? "s" : ""}</p>
                    {conversations.length > 0 && (
                      <button onClick={clearAllHistory} className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/45 transition-colors">
                        <Trash2 className="w-3 h-3" />Clear all
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                          <History className="w-5 h-5 text-white/15" />
                        </div>
                        <p className="text-[12px] text-white/20 font-light text-center">No conversations yet.<br />Start chatting to save history.</p>
                      </div>
                    ) : (
                      conversations.map(convo => (
                        <motion.div
                          key={convo.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group flex items-start gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-150 relative"
                          style={{
                            background: currentConvoId === convo.id ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                            border: currentConvoId === convo.id ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(255,255,255,0.04)",
                          }}
                          onClick={() => loadConversation(convo)}
                          whileHover={{ scale: 1.005 }}
                        >
                          <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 mt-0.5">
                            <MessageCircle className="w-3 h-3 text-white/25" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-white/60 font-light truncate leading-snug">{convo.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-2.5 h-2.5 text-white/15" />
                              <span className="text-[10px] text-white/20">{timeAgo(convo.updatedAt)}</span>
                              <span className="text-[9px] text-white/10">·</span>
                              <span className="text-[10px] text-white/15">{convo.messages.length} msgs</span>
                            </div>
                          </div>
                          <button
                            onClick={e => deleteConversation(convo.id, e)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/20 hover:text-white/50 transition-all shrink-0 mt-0.5"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div className="shrink-0 px-4 py-3 border-t border-white/[0.04]">
                    <button
                      onClick={startNewChat}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <Plus className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[12px] text-white/35 font-light">New Conversation</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB Button ── */}
      <motion.button
        onClick={() => { setIsOpen(o => !o); setHasNewMessage(false); }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 right-4 sm:right-6 z-[60] w-14 h-14 rounded-2xl flex items-center justify-center relative"
        style={{
          background: isOpen
            ? "rgba(255,255,255,0.06)"
            : "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
          border: isOpen ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.15)",
          boxShadow: isOpen
            ? "0 8px 30px rgba(0,0,0,0.5)"
            : "0 12px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 30px rgba(255,255,255,0.03)",
        }}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.06), transparent 60%)" }} />
        </div>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ scale: 0.5, rotate: -90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.5, rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-5 h-5 text-white/50 relative z-10" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0.5, rotate: 90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.5, rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-5 h-5 text-white/75 relative z-10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* New message dot */}
        <AnimatePresence>
          {hasNewMessage && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white/80 border-2 border-[#060609]"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
