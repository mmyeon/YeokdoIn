import * as React from "react";

import { cn } from "@/lib/utils";

type PlateSize = 25 | 20 | 15 | 10 | 5 | 2.5 | 1.25;

interface PlateSpec {
  color: string;
  h: number;
  w: number;
  stroke?: boolean;
  textColor: string;
}

const PLATE_SPEC: Readonly<Record<PlateSize, PlateSpec>> = {
  25: { color: "#c94242", h: 74, w: 18, textColor: "#fff" },
  20: { color: "#2d62b8", h: 72, w: 17, textColor: "#fff" },
  15: { color: "#d4b21f", h: 68, w: 16, textColor: "#fff" },
  10: { color: "#2e8f4a", h: 62, w: 15, textColor: "#fff" },
  5: { color: "#ffffff", h: 50, w: 11, stroke: true, textColor: "#111" },
  2.5: { color: "#c94242", h: 36, w: 9, textColor: "#fff" },
  1.25: { color: "#b8b8b8", h: 28, w: 7, textColor: "#fff" },
};

const PLATE_SIZES: ReadonlyArray<PlateSize> = [25, 20, 15, 10, 5, 2.5, 1.25];

function plateBreakdown(totalKg: number, barWeight = 20): PlateSize[] {
  const perSide = (totalKg - barWeight) / 2;
  if (perSide <= 0) return [];
  const plates: PlateSize[] = [];
  let remain = perSide;
  for (const size of PLATE_SIZES) {
    while (remain >= size - 0.001) {
      plates.push(size);
      remain -= size;
    }
  }
  return plates;
}

interface BarbellProps extends React.ComponentProps<"div"> {
  totalKg?: number;
  barWeight?: number;
  width?: number;
}

function Barbell({
  totalKg = 60,
  barWeight = 20,
  width = 320,
  className,
  style,
  ...props
}: BarbellProps) {
  const plates = plateBreakdown(totalKg, barWeight);
  const centerY = 80;
  const sides: ReadonlyArray<{ side: "left" | "right"; dir: "row" | "row-reverse" }> = [
    { side: "right", dir: "row" },
    { side: "left", dir: "row-reverse" },
  ];

  return (
    <div
      data-slot="barbell"
      role="img"
      aria-label={`Barbell loaded to ${totalKg}kg`}
      className={cn("relative", className)}
      style={{ width, height: 160, ...style }}
      {...props}
    >
      <div
        className="absolute left-0 right-0 rounded-sm bg-yd-text-muted"
        style={{ top: centerY - 3, height: 6 }}
      />
      <div
        className="absolute rounded-sm bg-yd-text-muted/75"
        style={{ left: 38, top: centerY - 7, width: 54, height: 14 }}
      />
      <div
        className="absolute rounded-sm bg-yd-text-muted/75"
        style={{ right: 38, top: centerY - 7, width: 54, height: 14 }}
      />
      <div
        className="absolute rounded-sm bg-yd-text-muted"
        style={{ left: 24, top: centerY - 16, width: 10, height: 32 }}
      />
      <div
        className="absolute rounded-sm bg-yd-text-muted"
        style={{ right: 24, top: centerY - 16, width: 10, height: 32 }}
      />

      {sides.map(({ side, dir }) => (
        <div
          key={side}
          className="absolute top-0 flex h-40 items-center gap-0.5"
          style={{ [side]: 44, flexDirection: dir }}
        >
          {plates.map((plateSize, i) => {
            const spec = PLATE_SPEC[plateSize];
            return (
              <div
                key={i}
                className="flex items-center justify-center rounded-sm font-mono text-[8px] font-bold"
                style={{
                  width: spec.w,
                  height: spec.h,
                  background: spec.color,
                  border: spec.stroke
                    ? "1.5px solid #111"
                    : "1px solid rgba(0,0,0,0.25)",
                  color: spec.textColor,
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                }}
              >
                {plateSize}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export { Barbell, plateBreakdown, PLATE_SPEC };
export type { BarbellProps, PlateSize };
