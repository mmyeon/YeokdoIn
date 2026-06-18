"use client";

function formatMs(ms: number): string {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = (totalSec % 60).toFixed(1);
  return `${m}:${s.padStart(4, "0")}`;
}

export interface KeyFrameMetric {
  key: string;
  value: string;
  accent?: boolean;
  note?: string;
}

interface KeyFrameCardProps {
  frameId: "A" | "B" | "C";
  label: string;
  timeMs: number;
  metrics: KeyFrameMetric[];
  isActive: boolean;
  onClick: () => void;
}

export function KeyFrameCard({
  frameId,
  label,
  timeMs,
  metrics,
  isActive,
  onClick,
}: KeyFrameCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl p-2 flex gap-2.5 items-stretch transition-colors"
      style={{
        border: `1px solid ${isActive ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
        background: isActive ? "hsl(var(--primary) / 0.07)" : "transparent",
      }}
    >
      {/* Content */}
      <div className="flex-1 flex flex-col gap-1 justify-center min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
              style={{
                background: isActive ? "hsl(var(--primary))" : "transparent",
                color: isActive
                  ? "hsl(var(--primary-foreground))"
                  : "hsl(var(--primary))",
                border: `1.5px solid hsl(var(--primary))`,
              }}
            >
              {frameId}
            </div>
            <span className="text-[13px] font-bold truncate">{label}</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono shrink-0">
            {formatMs(timeMs)}
          </span>
        </div>

        <div className="flex gap-3 pl-7 flex-wrap items-baseline">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-baseline gap-1">
              <span className="text-[10px] text-muted-foreground">{m.key}</span>
              <span
                className="text-[12px] font-bold font-mono"
                style={m.accent ? { color: "hsl(var(--primary))" } : undefined}
              >
                {m.value}
              </span>
              {m.note && (
                <span className="text-[9px] text-muted-foreground italic">
                  ({m.note})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
