import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Sparkles, ExternalLink, ArrowRight,
  Bot, User, Loader2, ChevronRight, Clock, Trash2, Plus,
  History, Zap, RotateCcw, ChevronDown, Copy, Check,
  Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Waves,
  AlertCircle,
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
  return { text: text.trim(), cards };
}

function cleanTextForTTS(content: string): string {
  let text = content;
  text = text.replace(/```partner-card[\s\S]*?```/g, "");
  text = text.replace(/```[\s\S]*?```/g, "");
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
      processed = <h4 key={i} className="text-xs font-display font-medium text-white/80 mt-2 mb-1">{line.slice(4)}</h4>;
    } else if (line.startsWith("## ")) {
      processed = <h3 key={i} className="text-sm font-display font-medium text-white/80 mt-2 mb-1">{line.slice(3)}</h3>;
    } else if (line.startsWith("# ")) {
      processed = <h2 key={i} className="text-sm font-display font-medium text-white/90 mt-2 mb-1">{line.slice(2)}</h2>;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      processed = (
        <div key={i} className="flex gap-1.5 pl-1 mb-0.5">
          <span className="text-white/30 mt-px">•</span>
          <span>{renderInlineMarkdown(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        processed = (
          <div key={i} className="flex gap-1.5 pl-1 mb-0.5">
            <span className="text-white/40 font-medium text-[11px] mt-px min-w-[14px]">{match[1]}.</span>
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
      parts.push(<strong key={key++} className="font-medium text-white/90">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function PartnerCardPreview({ card, onNavigate }: { card: PartnerCard; onNavigate: (slug: string) => void }) {
  return (
    <div
      className="mt-2 mb-1 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 cursor-pointer hover:border-white/[0.15] hover:bg-white/[0.04] transition-all group"
      onClick={() => onNavigate(card.slug)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[9px] uppercase tracking-widest text-white/30 font-display">{card.category}</span>
            {card.badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-[8px] text-white/50 font-display">{card.badge}</span>
            )}
            {card.badgeSecondary && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[8px] text-white/40 font-display">{card.badgeSecondary}</span>
            )}
          </div>
          <h4 className="text-sm font-display font-light text-white truncate">{card.name}</h4>
          {card.tagline && <p className="text-[11px] text-white/35 font-light mt-0.5 truncate leading-tight">{card.tagline}</p>}
        </div>
        <div className="flex items-center gap-1 text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-1">
          <span className="text-[9px] font-display">View</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  { text: "How do I earn entries?", icon: <Zap className="w-3 h-3" /> },
  { text: "Tell me about available partners", icon: <ExternalLink className="w-3 h-3" /> },
  { text: "What are the rules?", icon: <Sparkles className="w-3 h-3" /> },
  { text: "How does the prize draw work?", icon: <Clock className="w-3 h-3" /> },
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
  return text.length > 40 ? text.slice(0, 40) + "..." : text;
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
  const colors: Record<VoiceStatus, string> = {
    idle: "rgba(255,255,255,0.06)",
    listening: "rgba(255,255,255,0.12)",
    transcribing: "rgba(255,255,255,0.08)",
    thinking: "rgba(255,255,255,0.08)",
    speaking: "rgba(255,255,255,0.1)",
  };

  return (
    <div className="relative flex items-center justify-center w-44 h-44">
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full border border-white/[0.06]"
            animate={{ width: [140, 176, 140], height: [140, 176, 140], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: status === "speaking" ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full border border-white/[0.04]"
            animate={{ width: [140, 196, 140], height: [140, 196, 140], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: status === "speaking" ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </>
      )}
      <motion.div
        className="w-36 h-36 rounded-full flex items-center justify-center relative"
        style={{ background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.08), ${colors[status]})`, border: "1px solid rgba(255,255,255,0.1)", boxShadow: isActive ? "0 0 40px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)" : "none" }}
        animate={isActive ? { scale: [1, 1.03, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
      >
        {status === "listening" && <Mic className="w-10 h-10 text-white/70" />}
        {status === "transcribing" && <Loader2 className="w-10 h-10 text-white/50 animate-spin" />}
        {status === "thinking" && (
          <div className="flex gap-1.5">
            <motion.div className="w-2 h-2 rounded-full bg-white/40" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} />
            <motion.div className="w-2 h-2 rounded-full bg-white/40" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }} />
            <motion.div className="w-2 h-2 rounded-full bg-white/40" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }} />
          </div>
        )}
        {status === "speaking" && <Waves className="w-10 h-10 text-white/60" />}
        {status === "idle" && <Mic className="w-10 h-10 text-white/30" />}
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

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

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
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const getPageContext = useCallback(() => {
    if (location.includes("/partners/")) {
      const slug = location.split("/partners/")[1];
      return `Partner Detail page for: ${slug}`;
    }
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

      if (!res.ok) {
        setVoiceStatus(isVoiceMode ? "idle" : "idle");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
        setVoiceStatus("idle");
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
        setVoiceStatus("idle");
      };

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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setCurrentStreamContent("");
    setMsgCount(c => c + 1);
    if (fromVoice) setVoiceStatus("thinking");

    const chatHistory = [...messages.filter(m => m.id !== "welcome"), userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

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
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) {
                fullContent += data.content;
                setCurrentStreamContent(fullContent);
              }
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
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentStreamContent("");

      if (!isOpen) setHasNewMessage(true);

      if (isVoiceMode || ttsEnabled) {
        setVoiceLastResponse(cleanTextForTTS(fullContent));
        await speakText(fullContent);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 500) {
          setVoiceStatus("idle");
          setIsRecording(false);
          return;
        }
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
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  async function transcribeAudio(blob: Blob, mimeType: string) {
    setVoiceStatus("transcribing");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/voice/stt", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("STT failed");

      const data = await res.json() as { transcript: string };
      const transcript = data.transcript?.trim();

      if (!transcript) {
        setVoiceStatus("idle");
        setVoiceError("Couldn't understand that. Please try again.");
        return;
      }

      setVoiceTranscript(transcript);
      if (isVoiceMode) {
        setInput(transcript);
        await handleSend(transcript, true);
      } else {
        setInput(transcript);
        await handleSend(transcript, false);
      }
    } catch {
      setVoiceError("Transcription failed. Please try again.");
      setVoiceStatus("idle");
    }
  }

  function getSupportedMimeType(): string {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      stopSpeaking();
      startRecording();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function renderMessageContent(content: string) {
    const { text, cards } = parsePartnerCards(content);
    return (
      <>
        <div className="whitespace-pre-wrap text-[13px] leading-relaxed">{formatMarkdown(text)}</div>
        {cards.map((card, i) => (
          <PartnerCardPreview key={`${card.slug}-${i}`} card={card} onNavigate={handleNavigate} />
        ))}
      </>
    );
  }

  const realMsgCount = messages.filter(m => m.id !== "welcome").length;

  const voiceStatusLabel: Record<VoiceStatus, string> = {
    idle: "Tap mic to speak",
    listening: "Listening...",
    transcribing: "Processing...",
    thinking: "Thinking...",
    speaking: "Speaking...",
  };

  return (
    <>
      {/* ── Voice Mode Full-Screen Overlay ── */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex flex-col"
            style={{
              background: "rgba(4, 4, 6, 0.98)",
              backdropFilter: "blur(40px)",
            }}
          >
            <div className="noise-overlay opacity-50" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-safe pt-6 pb-4">
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
                  title={ttsEnabled ? "Mute AI voice" : "Unmute AI voice"}
                >
                  {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setIsVoiceMode(false); stopSpeaking(); if (isRecording) stopRecording(); }}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Orb */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-6">
              <VoiceOrb status={voiceStatus} />

              <div className="text-center space-y-2">
                <p className="text-[11px] font-display uppercase tracking-[0.2em] text-white/30">
                  {voiceStatusLabel[voiceStatus]}
                </p>
                {voiceTranscript && voiceStatus !== "idle" && (
                  <p className="text-sm text-white/50 font-light max-w-xs text-center leading-relaxed">
                    "{voiceTranscript}"
                  </p>
                )}
                {voiceError && (
                  <p className="text-[11px] text-white/40 font-light flex items-center gap-1 justify-center">
                    <AlertCircle className="w-3 h-3" />
                    {voiceError}
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

            {/* Mic Button */}
            <div className="relative z-10 flex flex-col items-center gap-4 px-6 pb-safe pb-12">
              {voiceStatus === "speaking" && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/50 text-[11px] font-display hover:bg-white/[0.1] transition-all"
                >
                  <VolumeX className="w-3 h-3" />
                  Stop Speaking
                </button>
              )}

              <motion.button
                onClick={toggleRecording}
                disabled={voiceStatus === "transcribing" || voiceStatus === "thinking"}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                {isRecording
                  ? <MicOff className="w-7 h-7 text-white/80" />
                  : <Mic className="w-7 h-7 text-white/50" />
                }
              </motion.button>
              <p className="text-[10px] text-white/20 font-light">
                {isRecording ? "Tap to stop" : "Tap to speak"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-32px)] sm:w-[420px] max-h-[78vh] flex flex-col"
            style={{
              background: "rgba(5, 5, 8, 0.98)",
              backdropFilter: "blur(60px)",
              WebkitBackdropFilter: "blur(60px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              boxShadow: "0 30px 100px rgba(0, 0, 0, 0.9), 0 0 0 0.5px rgba(255, 255, 255, 0.03), 0 0 60px rgba(255, 255, 255, 0.015), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
            }}
          >
            {/* Header */}
            <div
              className="shrink-0"
              style={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "24px 24px 0 0",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.025) 0%, transparent 100%)",
              }}
            >
              <div className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center relative">
                    <Sparkles className="w-4 h-4 text-white/70" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white/60 border-2 border-[#050508]" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-display font-light text-white tracking-wide">X247 Assistant</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-white/40 font-light">
                        {isStreaming ? "Thinking..." : "Online · GPT-4o"}
                      </span>
                      {msgCount > 0 && (
                        <>
                          <span className="text-[8px] text-white/10">•</span>
                          <span className="text-[9px] text-white/20 font-light">{msgCount} {msgCount === 1 ? "msg" : "msgs"}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setTtsEnabled(e => !e)}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${ttsEnabled ? "bg-white/[0.06] border-white/[0.1] text-white/50" : "bg-white/[0.02] border-white/[0.05] text-white/20"}`}
                    title={ttsEnabled ? "Mute AI voice" : "Unmute AI voice"}
                  >
                    {ttsEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => { setIsVoiceMode(true); setIsOpen(false); }}
                    className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                    title="Voice mode"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={startNewChat}
                    className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                    title="New chat"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex px-5 pb-0 gap-1">
                {(["chat", "history"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 text-[11px] font-display font-light rounded-t-lg transition-all relative ${activeTab === tab ? "text-white/80 bg-white/[0.04]" : "text-white/30 hover:text-white/50"}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {tab === "chat" ? <MessageCircle className="w-3 h-3" /> : <History className="w-3 h-3" />}
                      {tab === "chat" ? "Chat" : "Recent"}
                      {tab === "history" && conversations.length > 0 && (
                        <span className="ml-0.5 px-1.5 py-0 rounded-full bg-white/[0.08] text-[9px] text-white/40">{conversations.length}</span>
                      )}
                    </span>
                    {activeTab === tab && (
                      <motion.div layoutId="chatTab" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/20 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <AnimatePresence mode="wait">
              {activeTab === "chat" ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-2.5 group ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${msg.role === "user" ? "bg-white/[0.06] border border-white/[0.1]" : "bg-white/[0.04] border border-white/[0.06]"}`}>
                          {msg.role === "user" ? <User className="w-3 h-3 text-white/40" /> : <Bot className="w-3 h-3 text-white/40" />}
                        </div>
                        <div className="relative max-w-[82%]">
                          <div className={`rounded-2xl px-3.5 py-2.5 ${msg.role === "user" ? "bg-white/[0.07] border border-white/[0.1] text-white/90" : "bg-transparent text-white/70"}`}>
                            {renderMessageContent(msg.content)}
                          </div>
                          {msg.id !== "welcome" && msg.role === "assistant" && (
                            <div className="absolute -bottom-5 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => speakText(msg.content)}
                                className="p-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/20 hover:text-white/50"
                                title="Read aloud"
                              >
                                <Volume2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => copyMessage(msg.content, msg.id)}
                                className="p-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/20 hover:text-white/50"
                                title="Copy"
                              >
                                {copiedId === msg.id ? <Check className="w-2.5 h-2.5 text-white/60" /> : <Copy className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isStreaming && currentStreamContent && (
                      <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5 bg-white/[0.04] border border-white/[0.06]">
                          <Bot className="w-3 h-3 text-white/40" />
                        </div>
                        <div className="max-w-[82%] text-white/70">
                          {renderMessageContent(currentStreamContent)}
                          <span className="inline-block w-1.5 h-4 bg-white/30 animate-pulse ml-0.5 rounded-sm" />
                        </div>
                      </div>
                    )}

                    {isStreaming && !currentStreamContent && (
                      <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5 bg-white/[0.04] border border-white/[0.06]">
                          <Bot className="w-3 h-3 text-white/40" />
                        </div>
                        <div className="flex items-center gap-1.5 px-3.5 py-2.5">
                          <div className="flex gap-1">
                            {[0, 150, 300].map((delay) => (
                              <span key={delay} className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                            ))}
                          </div>
                          <span className="text-[11px] text-white/20 font-light ml-1">Thinking</span>
                        </div>
                      </div>
                    )}

                    {messages.length <= 1 && !isStreaming && (
                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/15 font-display px-1 mb-3">Quick Questions</p>
                        <div className="grid grid-cols-2 gap-2">
                          {SUGGESTIONS.map((s) => (
                            <button
                              key={s.text}
                              onClick={() => handleSend(s.text)}
                              className="text-left px-3 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.05] text-white/40 text-[11px] font-light hover:bg-white/[0.05] hover:text-white/60 hover:border-white/[0.08] transition-all group"
                            >
                              <span className="flex items-center gap-1.5 text-white/20 group-hover:text-white/40 transition-colors mb-1">{s.icon}</span>
                              <span className="leading-tight">{s.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="shrink-0 px-4 pb-4 pt-2">
                    {voiceError && (
                      <div className="flex items-center gap-1.5 px-3 py-2 mb-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/35">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {voiceError}
                      </div>
                    )}
                    <div
                      className="flex items-center gap-2 rounded-2xl px-3 py-2.5 transition-all focus-within:border-white/[0.12]"
                      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? "Listening..." : "Ask anything about X247..."}
                        disabled={isStreaming || isRecording}
                        className="flex-1 bg-transparent text-white/90 text-[13px] font-light placeholder-white/20 outline-none disabled:opacity-50 min-w-0"
                      />

                      <motion.button
                        onClick={toggleRecording}
                        disabled={isStreaming || voiceStatus === "transcribing"}
                        whileTap={{ scale: 0.9 }}
                        className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0 disabled:opacity-30 ${isRecording ? "bg-white/[0.1] border-white/[0.2] text-white/80" : "bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.06]"}`}
                        title={isRecording ? "Stop recording" : "Voice input"}
                      >
                        <AnimatePresence mode="wait">
                          {isRecording ? (
                            <motion.div key="stop" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                              {voiceStatus === "transcribing"
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <MicOff className="w-3.5 h-3.5" />
                              }
                            </motion.div>
                          ) : (
                            <motion.div key="mic" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                              <Mic className="w-3.5 h-3.5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {isRecording && (
                          <motion.div
                            className="absolute inset-0 rounded-xl border border-white/30"
                            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        )}
                      </motion.button>

                      <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isStreaming}
                        className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:border-white/[0.2] shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 px-1">
                      <p className="text-[9px] text-white/12 font-light">Powered by GPT-4o · ElevenLabs Voice</p>
                      {realMsgCount > 0 && (
                        <button
                          onClick={startNewChat}
                          className="text-[9px] text-white/15 font-light hover:text-white/30 transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          New chat
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-y-auto min-h-0"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}
                >
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 px-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                        <History className="w-5 h-5 text-white/15" />
                      </div>
                      <p className="text-sm text-white/25 font-display font-light mb-1">No recent chats</p>
                      <p className="text-[11px] text-white/15 font-light text-center">Your conversations will appear here once you start chatting.</p>
                      <button
                        onClick={() => setActiveTab("chat")}
                        className="mt-4 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/40 font-display font-light hover:bg-white/[0.06] transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" />
                        Start a chat
                      </button>
                    </div>
                  ) : (
                    <div className="p-3">
                      <div className="flex items-center justify-between px-2 mb-3">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/20 font-display">
                          {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
                        </p>
                        <button
                          onClick={clearAllHistory}
                          className="text-[10px] text-white/20 hover:text-white/40 transition-colors font-light flex items-center gap-1"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {conversations.map((convo) => {
                          const msgPreview = convo.messages.filter(m => m.role === "assistant").pop();
                          return (
                            <div
                              key={convo.id}
                              onClick={() => loadConversation(convo)}
                              className={`group rounded-xl px-3.5 py-3 cursor-pointer transition-all border ${currentConvoId === convo.id ? "bg-white/[0.05] border-white/[0.1]" : "bg-white/[0.015] border-transparent hover:bg-white/[0.035] hover:border-white/[0.06]"}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] text-white/65 font-light truncate">{convo.title}</p>
                                  {msgPreview && (
                                    <p className="text-[10px] text-white/25 font-light mt-1 truncate leading-tight">
                                      {parsePartnerCards(msgPreview.content).text.slice(0, 60)}...
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[9px] text-white/15 font-light">{timeAgo(convo.updatedAt)}</span>
                                    <span className="text-[8px] text-white/10">•</span>
                                    <span className="text-[9px] text-white/15 font-light">{convo.messages.length} msgs</span>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => deleteConversation(convo.id, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/20 hover:text-white/50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Button ── */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); setHasNewMessage(false); }}
        className="fixed bottom-6 right-4 sm:right-6 z-[60] w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.7), 0 0 0 0.5px rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5 text-white/80" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-5 h-5 text-white/80" />
            </motion.div>
          )}
        </AnimatePresence>
        {hasNewMessage && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-black"
          />
        )}
      </motion.button>
    </>
  );
}
