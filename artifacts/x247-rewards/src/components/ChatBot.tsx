import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Sparkles, ExternalLink, ArrowRight,
  Bot, User, Loader2, ChevronRight
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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

function PartnerCardPreview({ card, onNavigate }: { card: PartnerCard; onNavigate: (slug: string) => void }) {
  const accentColors: Record<string, string> = {
    navy: "from-blue-900/30 to-blue-800/10",
    red: "from-red-900/30 to-red-800/10",
    neutral: "from-white/10 to-white/5",
  };
  const borderColors: Record<string, string> = {
    navy: "border-blue-500/20",
    red: "border-red-500/20",
    neutral: "border-white/10",
  };

  return (
    <div
      className={`mt-2 mb-1 rounded-xl bg-gradient-to-br ${accentColors[card.accent] || accentColors.navy} border ${borderColors[card.accent] || borderColors.navy} p-3 cursor-pointer hover:border-white/20 transition-all group`}
      onClick={() => onNavigate(card.slug)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-display">{card.category}</span>
            {card.badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-[8px] text-red-400 font-display">{card.badge}</span>
            )}
            {card.badgeSecondary && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-[8px] text-blue-400 font-display">{card.badgeSecondary}</span>
            )}
          </div>
          <h4 className="text-sm font-display font-light text-white truncate">{card.name}</h4>
          {card.tagline && <p className="text-[11px] text-white/40 font-light mt-0.5 truncate">{card.tagline}</p>}
        </div>
        <div className="flex items-center gap-1 text-white/30 group-hover:text-white/60 transition-colors shrink-0 mt-1">
          <span className="text-[9px] font-display">View</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "How do I earn entries?",
  "Tell me about available partners",
  "What are the rules?",
  "How does the prize draw work?",
];

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

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Hey! I'm the X247 AI Assistant. Ask me anything about the platform, partners, how to earn entries, or registration details. How can I help you today?",
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStreamContent]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getPageContext = useCallback(() => {
    if (location.includes("/partners/")) {
      const slug = location.split("/partners/")[1];
      return `Partner Detail page for: ${slug}`;
    }
    if (location === "/partners") return "Partners listing page";
    if (location === "/offers") return "Offers page";
    if (location === "/") return "Home page";
    return location;
  }, [location]);

  const handleNavigate = useCallback((slug: string) => {
    setLocation(`/partners/${slug}`);
    setIsOpen(false);
  }, [setLocation]);

  async function handleSend(messageText?: string) {
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

    const chatHistory = [...messages.filter(m => m.id !== "welcome"), userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          currentPage: getPageContext(),
        }),
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
              if (data.error) {
                fullContent += "\n\nSorry, something went wrong. Please try again.";
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

      if (!isOpen) {
        setHasNewMessage(true);
      }
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setCurrentStreamContent("");
    }

    setIsStreaming(false);
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
        <div className="whitespace-pre-wrap text-[13px] leading-relaxed">{text}</div>
        {cards.map((card, i) => (
          <PartnerCardPreview key={`${card.slug}-${i}`} card={card} onNavigate={handleNavigate} />
        ))}
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-32px)] sm:w-[400px] max-h-[70vh] flex flex-col"
            style={{
              background: "rgba(8, 8, 12, 0.95)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.8), 0 0 0 0.5px rgba(255, 255, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                background: "linear-gradient(180deg, rgba(20, 25, 60, 0.15) 0%, transparent 100%)",
                borderRadius: "20px 20px 0 0",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-900/30 to-blue-900/30 border border-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-light text-white">X247 Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-white/40 font-light">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${msg.role === "user" ? "bg-white/[0.06] border border-white/[0.1]" : "bg-gradient-to-br from-red-900/20 to-blue-900/20 border border-white/[0.08]"}`}>
                    {msg.role === "user" ? <User className="w-3 h-3 text-white/50" /> : <Bot className="w-3 h-3 text-white/50" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${msg.role === "user" ? "bg-white/[0.06] border border-white/[0.08] text-white/90" : "bg-transparent text-white/80"}`}>
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))}

              {isStreaming && currentStreamContent && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5 bg-gradient-to-br from-red-900/20 to-blue-900/20 border border-white/[0.08]">
                    <Bot className="w-3 h-3 text-white/50" />
                  </div>
                  <div className="max-w-[85%] text-white/80">
                    {renderMessageContent(currentStreamContent)}
                  </div>
                </div>
              )}

              {isStreaming && !currentStreamContent && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5 bg-gradient-to-br from-red-900/20 to-blue-900/20 border border-white/[0.08]">
                    <Bot className="w-3 h-3 text-white/50" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />
                    <span className="text-[11px] text-white/30 font-light">Thinking...</span>
                  </div>
                </div>
              )}

              {messages.length <= 1 && !isStreaming && (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/25 font-display px-1">Quick Questions</p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 text-[12px] font-light hover:bg-white/[0.06] hover:text-white/70 hover:border-white/[0.1] transition-all flex items-center justify-between group"
                    >
                      <span>{s}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 px-4 pb-4 pt-2">
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about X247..."
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-white/90 text-[13px] font-light placeholder-white/25 outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-900/30 to-blue-900/30 border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-white/[0.2]"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-center text-[9px] text-white/15 mt-2 font-light">Powered by X247 AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => { setIsOpen(!isOpen); setHasNewMessage(false); }}
        className="fixed bottom-6 right-4 sm:right-6 z-[60] w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(140, 20, 30, 0.4) 0%, rgba(20, 30, 80, 0.4) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(20px)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-black animate-pulse" />
        )}
      </motion.button>
    </>
  );
}
