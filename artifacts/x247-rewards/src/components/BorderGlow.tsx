import { useRef, useCallback, type ReactNode, type CSSProperties, type ElementType } from "react";

interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  borderRadius?: string;
  glowPadding?: string;
  cardBg?: string;
  as?: ElementType;
  [key: string]: unknown;
}

export default function BorderGlow({
  children,
  className = "",
  style,
  borderRadius = "16px",
  glowPadding = "20px",
  cardBg = "#060010",
  as: Tag = "div",
  ...rest
}: BorderGlowProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const distToLeft = mouseX;
    const distToRight = rect.width - mouseX;
    const distToTop = mouseY;
    const distToBottom = rect.height - mouseY;
    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    const maxInset = Math.min(rect.width, rect.height) / 2;
    const proximity = Math.max(0, Math.min(100, 100 - (minDist / maxInset) * 100));

    el.style.setProperty("--edge-proximity", String(proximity));
    el.style.setProperty("--cursor-angle", `${angle}deg`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--edge-proximity", "0");
  }, []);

  return (
    <Tag
      ref={ref as any}
      className={`border-glow-card ${className}`}
      style={{
        "--border-radius": borderRadius,
        "--glow-padding": glowPadding,
        "--card-bg": cardBg,
        ...style,
      } as CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <span className="edge-light" />
      <span className="border-glow-inner">{children}</span>
    </Tag>
  );
}
