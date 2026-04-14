import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ArrowUpRight, User, LogOut, Settings, ChevronDown } from "lucide-react";
import "./CardNav.css";

interface NavLink {
  label: string;
  href: string;
  spa?: boolean;
  icon?: React.ReactNode;
  divider?: boolean;
}

interface NavItem {
  label: string;
  bgColor: string;
  textColor: string;
  icon?: React.ReactNode;
  links: NavLink[];
}

interface UserInfo {
  fullName: string;
  email: string;
}

interface CardNavProps {
  logo: React.ReactNode;
  items: NavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  onCtaClick?: () => void;
  renderLink?: (href: string, children: React.ReactNode, className: string) => React.ReactNode;
  isLoggedIn?: boolean;
  user?: UserInfo | null;
  onLogout?: () => void;
  onNavigate?: (path: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const CardNav = ({
  logo,
  items,
  className = "",
  ease = "power3.out",
  baseColor = "#0a0a0a",
  menuColor,
  buttonBgColor = "rgba(255,255,255,0.08)",
  buttonTextColor = "#fff",
  onCtaClick,
  renderLink,
  isLoggedIn = false,
  user,
  onLogout,
  onNavigate,
}: CardNavProps) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const avatarBtnRef = useRef<HTMLDivElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inBtn = avatarBtnRef.current?.contains(target);
      const inMenu = avatarMenuRef.current?.contains(target);
      if (!inBtn && !inMenu) {
        setAvatarOpen(false);
      }
    };
    if (avatarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarOpen]);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 350;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement;
      if (contentEl) {
        const wasVis = contentEl.style.visibility;
        const wasPE = contentEl.style.pointerEvents;
        const wasPos = contentEl.style.position;
        const wasH = contentEl.style.height;
        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";
        contentEl.offsetHeight;
        const h = 60 + contentEl.scrollHeight + 16;
        contentEl.style.visibility = wasVis;
        contentEl.style.pointerEvents = wasPE;
        contentEl.style.position = wasPos;
        contentEl.style.height = wasH;
        return h;
      }
    }
    return 350;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    });

    tl.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
      "-=0.1"
    );

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) tlRef.current = newTl;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const resetToCollapsed = () => {
    const navEl = navRef.current;
    if (!navEl) return;
    tlRef.current?.kill();
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });
    const newTl = createTimeline();
    tlRef.current = newTl;
    setIsHamburgerOpen(false);
    setIsExpanded(false);
  };

  const closeMenu = (instant?: boolean) => {
    if (instant) {
      resetToCollapsed();
      return;
    }
    const tl = tlRef.current;
    if (!tl || !isExpanded) return;
    setIsHamburgerOpen(false);
    tl.eventCallback("onReverseComplete", () => {
      setIsExpanded(false);
    });
    tl.reverse();
  };

  const toggleMenu = () => {
    if (!isExpanded) {
      let tl = tlRef.current;
      if (!tl) {
        tl = createTimeline();
        tlRef.current = tl;
      }
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      closeMenu();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""}`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="card-nav-top">
          <button
            type="button"
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            aria-expanded={isExpanded}
            aria-controls="card-nav-panel"
            style={{ color: menuColor || "#fff", background: "none", border: "none" }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </button>

          <div className="logo-container">{logo}</div>

          {isLoggedIn && user ? (
            <div className="avatar-wrapper" ref={avatarBtnRef}>
              <button
                type="button"
                className="avatar-button"
                onClick={() => setAvatarOpen(!avatarOpen)}
                aria-label="User menu"
              >
                <div className="avatar-circle">
                  <span className="avatar-initials">{getInitials(user.fullName)}</span>
                </div>
                <ChevronDown className={`avatar-chevron ${avatarOpen ? "rotated" : ""}`} />
              </button>

              {avatarOpen && createPortal(
                <div className="avatar-dropdown" ref={avatarMenuRef}>
                  <div className="avatar-dropdown-header">
                    <div className="avatar-dropdown-avatar">
                      <span>{getInitials(user.fullName)}</span>
                    </div>
                    <div className="avatar-dropdown-info">
                      <span className="avatar-dropdown-name">{user.fullName}</span>
                      <span className="avatar-dropdown-email">{user.email}</span>
                    </div>
                  </div>
                  <div className="avatar-dropdown-divider" />
                  <button
                    type="button"
                    className="avatar-dropdown-item"
                    onClick={() => {
                      setAvatarOpen(false);
                      onNavigate?.("/account");
                    }}
                  >
                    <User className="avatar-dropdown-icon" />
                    My Account
                  </button>
                  <button
                    type="button"
                    className="avatar-dropdown-item"
                    onClick={() => {
                      setAvatarOpen(false);
                      onNavigate?.("/account");
                    }}
                  >
                    <Settings className="avatar-dropdown-icon" />
                    Settings
                  </button>
                  <div className="avatar-dropdown-divider" />
                  <button
                    type="button"
                    className="avatar-dropdown-item avatar-dropdown-logout"
                    onClick={() => {
                      setAvatarOpen(false);
                      onLogout?.();
                    }}
                  >
                    <LogOut className="avatar-dropdown-icon" />
                    Log Out
                  </button>
                </div>,
                document.body
              )}
            </div>
          ) : (
            <button
              type="button"
              className="card-nav-cta-button"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              onClick={onCtaClick}
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Join</span>
            </button>
          )}
        </div>

        <div
          id="card-nav-panel"
          className="card-nav-content"
          aria-hidden={!isExpanded}
          {...(!isExpanded ? { inert: true as any } : {})}
        >
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">
                {item.icon && <span className="nav-card-label-icon">{item.icon}</span>}
                {item.label}
              </div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => {
                  if (lnk.divider) {
                    return <div key={`divider-${i}`} className="nav-card-link-divider" />;
                  }
                  const linkIcon = lnk.icon || <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />;
                  const content = (
                    <>
                      <span className="nav-card-link-icon-wrap">{linkIcon}</span>
                      {lnk.label}
                    </>
                  );
                  if (lnk.spa && renderLink) {
                    return (
                      <span key={`${lnk.label}-${i}`} onClick={() => closeMenu(true)}>
                        {renderLink(lnk.href, content, "nav-card-link")}
                      </span>
                    );
                  }
                  return (
                    <a
                      key={`${lnk.label}-${i}`}
                      className="nav-card-link"
                      href={lnk.href}
                      onClick={() => closeMenu(true)}
                    >
                      {content}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
