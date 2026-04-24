"use client";

import { PRHistoryEntry } from "@/types/personalRecords";

interface PRSparklineProps {
  history: ReadonlyArray<PRHistoryEntry>;
  width?: number;
  height?: number;
}

function PRSparkline({
  history,
  width = 300,
  height = 70,
}: PRSparklineProps) {
  const points = history
    .map((h) => ({ t: new Date(h.prDate).getTime(), w: h.newWeight }))
    .filter((p) => Number.isFinite(p.t))
    .sort((a, b) => a.t - b.t);

  if (points.length < 2) {
    return (
      <div className="flex h-[90px] items-center justify-center rounded-md border border-dashed border-yd-line text-[11px] text-yd-text-muted">
        기록이 2개 이상이면 그래프가 표시됩니다.
      </div>
    );
  }

  const tMin = points[0].t;
  const tMax = points[points.length - 1].t;
  const wMin = Math.min(...points.map((p) => p.w));
  const wMax = Math.max(...points.map((p) => p.w));
  const tSpan = Math.max(1, tMax - tMin);
  const wSpan = Math.max(1, wMax - wMin);

  const pad = 8;
  const plot = points.map((p) => ({
    x: pad + ((p.t - tMin) / tSpan) * (width - pad * 2),
    y: height - pad - ((p.w - wMin) / wSpan) * (height - pad * 2),
  }));

  const polyline = plot.map((p) => `${p.x},${p.y}`).join(" ");

  const fmt = (ms: number) => {
    const d = new Date(ms);
    return `${d.getMonth() + 1}월`;
  };

  return (
    <div className="relative h-[90px] w-full rounded-md border border-dashed border-yd-line p-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="70"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <polyline
          points={polyline}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="text-yd-primary"
        />
        {plot.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="currentColor"
            className="text-yd-primary"
          />
        ))}
      </svg>
      <span className="absolute bottom-1.5 left-3 text-[10px] text-yd-text-muted">
        {fmt(tMin)}
      </span>
      <span className="absolute bottom-1.5 right-3 text-[10px] text-yd-text-muted">
        {fmt(tMax)}
      </span>
    </div>
  );
}

export default PRSparkline;
