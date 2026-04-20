import React, { useState } from "react";
import { Link } from "wouter";
import { Shield, Sun, Moon } from "lucide-react";
import AdminGateModal from "./AdminGateModal";
import { useTheme, LIGHT_THEMES, type ThemeId } from "@/contexts/ThemeContext";

interface FooterLink {
  label: string;
  href: string;
}

interface SiteFooterProps {
  links?: FooterLink[];
  children?: React.ReactNode;
}

export default function SiteFooter({ links, children }: SiteFooterProps) {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const { theme, setTheme, isLight } = useTheme();

  const toggleMode = () => {
    if (isLight) {
      setTheme("metallic-glass");
    } else {
      setTheme("pristine-light");
    }
  };

  return (
    <>
      <footer className="site-footer pt-0 pb-8 sm:pb-12 relative">
        <div className="footer-gradient-line mb-12 sm:mb-16" />
        <div className="container mx-auto px-4 sm:px-6">
          {children}
          <div className="flex justify-center mb-8 sm:mb-10">
            <Link href="/" aria-label="X247 home" className="inline-block opacity-70 hover:opacity-100 transition-opacity">
              <img
                src="/x247-wordmark.png"
                alt="X247"
                className="h-9 sm:h-11 w-auto object-contain select-none"
                draggable={false}
              />
            </Link>
          </div>
          <div className="footer-bottom-border pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-light footer-muted-text">
              <p>&copy; 2026 X247 Rewards Protocol. All rights reserved.</p>
              <div className="flex gap-5 items-center">
                <button
                  onClick={toggleMode}
                  className="footer-theme-toggle"
                  title={isLight ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {isLight ? (
                    <Moon className="w-3.5 h-3.5" />
                  ) : (
                    <Sun className="w-3.5 h-3.5" />
                  )}
                  <span>{isLight ? "Dark" : "Light"}</span>
                </button>
                {links?.map((link, i) => (
                  <Link key={i} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => setAdminModalOpen(true)}
                  className="footer-link flex items-center gap-1.5"
                >
                  <Shield className="w-3 h-3" />
                  Admin Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <AdminGateModal open={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
    </>
  );
}
