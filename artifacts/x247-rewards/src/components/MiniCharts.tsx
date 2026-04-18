import React from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  strokeColor = "rgba(255,255,255,0.35)",
  fillColor = "rgba(255,255,255,0.04)",
  strokeWidth = 1.5,
}: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padY = 2;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padY + ((max - v) / range) * (height - padY * 2);
    return { x, y };
  });

  const gradId = React.useId().replace(/:/g, "");
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const fillPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkFill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={1} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sparkFill-${gradId})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2} fill={strokeColor} />
    </svg>
  );
}

interface MiniBarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
}

export function MiniBarChart({
  data,
  width = 200,
  height = 64,
}: MiniBarChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const gap = 3;
  const barWidth = Math.max(4, (width - gap * (data.length - 1)) / data.length);
  const labelH = 14;
  const chartH = height - labelH;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mini-bar-chart-svg"
    >
      {data.map((d, i) => {
        const barH = Math.max(2, (d.value / max) * (chartH - 2));
        const x = i * (barWidth + gap);
        const y = chartH - barH;
        const isLast = i === data.length - 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={2}
              fill="currentColor"
              opacity={isLast ? 0.45 : 0.15}
            />
            <text
              x={x + barWidth / 2}
              y={height - 1}
              textAnchor="middle"
              fill="currentColor"
              opacity={0.3}
              fontSize={8}
              fontFamily="'Syne', sans-serif"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface UsageGaugeProps {
  used: number;
  limit: number | null;
  width?: number;
  height?: number;
}

export function UsageGauge({
  used,
  limit,
  width = 160,
  height = 8,
}: UsageGaugeProps) {
  const pct = limit ? Math.min(used / limit, 1) : (used > 0 ? 0.15 : 0);
  const fillW = pct > 0 ? Math.max(2, pct * width) : 0;

  const getColor = () => {
    if (!limit) return "rgba(255,255,255,0.25)";
    if (pct >= 0.9) return "rgba(239,68,68,0.5)";
    if (pct >= 0.7) return "rgba(245,158,11,0.4)";
    return "rgba(255,255,255,0.25)";
  };

  return (
    <div className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <rect x={0} y={0} width={width} height={height} rx={height / 2} fill="rgba(255,255,255,0.04)" />
        <rect x={0} y={0} width={fillW} height={height} rx={height / 2} fill={getColor()} />
      </svg>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-white/20 font-light">{used} used</span>
        <span className="text-[8px] text-white/20 font-light">{limit ? `${limit} limit` : "Unlimited"}</span>
      </div>
    </div>
  );
}

interface ActivityHeatmapProps {
  dates: string[];
  weeks?: number;
}

export function ActivityHeatmap({ dates, weeks = 8 }: ActivityHeatmapProps) {
  const cellSize = 10;
  const gap = 2;
  const days = weeks * 7;
  const today = new Date();

  const dateCounts: Record<string, number> = {};
  dates.forEach((d) => {
    dateCounts[d] = (dateCounts[d] || 0) + 1;
  });

  const cells: { date: string; count: number; col: number; row: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayOfWeek = d.getDay();
    const col = Math.floor((days - 1 - i) / 7);
    cells.push({ date: dateStr, count: dateCounts[dateStr] || 0, col, row: dayOfWeek });
  }

  const maxCount = Math.max(...cells.map((c) => c.count), 1);
  const svgW = weeks * (cellSize + gap);
  const svgH = 7 * (cellSize + gap);

  const getOpacity = (count: number) => {
    if (count === 0) return 0.06;
    return 0.15 + (count / maxCount) * 0.65;
  };

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="activity-heatmap-svg"
    >
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.col * (cellSize + gap)}
          y={cell.row * (cellSize + gap)}
          width={cellSize}
          height={cellSize}
          rx={2}
          fill="currentColor"
          opacity={getOpacity(cell.count)}
        />
      ))}
    </svg>
  );
}
