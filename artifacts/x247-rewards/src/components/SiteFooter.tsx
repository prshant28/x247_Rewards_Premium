import React, { useState } from "react";
import { Link } from "wouter";
import { Shield } from "lucide-react";
import AdminGateModal from "./AdminGateModal";

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

  return (
    <>
      <footer className="bg-black pt-0 pb-8 sm:pb-12 relative">
        <div className="footer-gradient-line mb-12 sm:mb-16" />
        <div className="container mx-auto px-4 sm:px-6">
          {children}
          <div className="border-t border-white/[0.04] pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-light text-white/20">
              <p>&copy; 2026 X247 Rewards Protocol. All rights reserved.</p>
              <div className="flex gap-5 items-center">
                {links?.map((link, i) => (
                  <Link key={i} href={link.href} className="hover:text-white/40 transition-colors duration-300">
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => setAdminModalOpen(true)}
                  className="hover:text-white/40 transition-colors duration-300 flex items-center gap-1.5"
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
