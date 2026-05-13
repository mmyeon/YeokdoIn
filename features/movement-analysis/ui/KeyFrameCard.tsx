"use client";

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(1);
  return `${m}:${s.padStart(4, "0")}`;
}

interface KeyFrameCardProps {
  label: string;
  timeMs: number;
  metricsLines: string[];
  onClick: () => void;
}

export function KeyFrameCard({
  label,
  timeMs,
  metricsLines,
  onClick,
}: KeyFrameCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border p-4 hover:bg-accent transition-colors"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">
          {formatTime(timeMs / 1000)}
        </span>
      </div>
      {metricsLines.map((line, i) => (
        <p key={i} className="text-sm text-muted-foreground">
          {line}
        </p>
      ))}
    </button>
  );
}
