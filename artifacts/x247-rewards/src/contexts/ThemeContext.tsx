import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeId =
  | "metallic-glass"
  | "frosted-aurora"
  | "brushed-steel"
  | "smoky-glass"
  | "noir-minimal"
  | "liquid-dark"
  | "pristine-light"
  | "ivory-soft"
  | "silver-mist";

export interface ThemeInfo {
  id: ThemeId;
  name: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    border: string;
    accent: string;
  };
}

export const THEMES: ThemeInfo[] = [
  {
    id: "metallic-glass",
    name: "Metallic Glass",
    description: "Ultra-black metallic with heavy glassmorphism",
    preview: { bg: "#050505", card: "#0a0a0c", border: "#1a1a1a", accent: "#2a2a2a" },
  },
  {
    id: "frosted-aurora",
    name: "Frosted Aurora",
    description: "Subtle aurora gradients, Apple-style elegance",
    preview: { bg: "#020204", card: "#0c0c10", border: "#1e1e24", accent: "#28283a" },
  },
  {
    id: "brushed-steel",
    name: "Brushed Steel",
    description: "Chrome highlights, industrial premium feel",
    preview: { bg: "#080808", card: "#121214", border: "#252528", accent: "#3a3a3e" },
  },
  {
    id: "smoky-glass",
    name: "Smoky Glass",
    description: "High transparency, see-through glass panels",
    preview: { bg: "#030303", card: "#08080a", border: "#181820", accent: "#222230" },
  },
  {
    id: "noir-minimal",
    name: "Noir Minimal",
    description: "Pure flat blacks, editorial magazine style",
    preview: { bg: "#000000", card: "#0a0a0a", border: "#1a1a1a", accent: "#ffffff" },
  },
  {
    id: "liquid-dark",
    name: "Liquid Dark",
    description: "Organic flowing aesthetic, artistic premium",
    preview: { bg: "#020203", card: "#0a0a0e", border: "#1a1a22", accent: "#2e2e3a" },
  },
  {
    id: "pristine-light",
    name: "Pristine Light",
    description: "Clean white, soft shadows, minimal elegance",
    preview: { bg: "#f5f5f5", card: "#ffffff", border: "#e0e0e0", accent: "#1a1a1a" },
  },
  {
    id: "ivory-soft",
    name: "Ivory Soft",
    description: "Warm ivory tones, paper-like texture, cozy premium",
    preview: { bg: "#f8f6f1", card: "#fffefa", border: "#e2ddd3", accent: "#2a2520" },
  },
  {
    id: "silver-mist",
    name: "Silver Mist",
    description: "Cool silver-blue, frosted glass, tech premium",
    preview: { bg: "#f0f1f5", card: "#f8f9fc", border: "#d4d6e0", accent: "#1c1e28" },
  },
];

const STORAGE_KEY = "x247_theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  themeInfo: ThemeInfo;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.some((t) => t.id === stored)) return stored as ThemeId;
    } catch {}
    return "metallic-glass";
  });

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (LIGHT_THEMES.includes(theme)) {
      document.documentElement.setAttribute("data-light", "");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.removeAttribute("data-light");
      document.documentElement.classList.add("dark");
    }
    return () => {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-light");
    };
  }, [theme]);

  const themeInfo = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeInfo }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const LIGHT_THEMES: ThemeId[] = ["pristine-light", "ivory-soft", "silver-mist"];

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return { ...ctx, isLight: LIGHT_THEMES.includes(ctx.theme) };
}
