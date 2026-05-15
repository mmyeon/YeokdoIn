"use client";

interface AnalyzingScreenProps {
  progress: number;
  pipelineStatus: "extracting" | "detecting";
  onCancel: () => void;
}

type StepState = "done" | "active" | "pending";

const PIPELINE_STEPS = [
  "Skeleton detection",
  "Key frame extraction",
  "Angle calculation",
] as const;

function getStepState(index: number, pipelineStatus: "extracting" | "detecting"): StepState {
  if (pipelineStatus === "extracting") {
    return index === 0 ? "active" : "pending";
  }
  if (index === 0) return "done";
  if (index === 1) return "active";
  return "pending";
}

const AnalyzingScreen = ({ progress, pipelineStatus, onCancel }: AnalyzingScreenProps) => {
  const pct = Math.round(progress * 100);

  return (
    <div className="flex flex-col h-[calc(100dvh-var(--tab-bar-height))] max-w-md mx-auto">
      {/* Step header */}
      <div className="px-5 py-2 flex items-center justify-between">
        <div className="w-6" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground uppercase tracking-[1.4px]">
            2 / 2
          </span>
          <span className="text-[13px] font-semibold">Analyzing…</span>
        </div>
        <div className="w-6" />
      </div>

      {/* Striped placeholder + spinner */}
      <div className="px-4 pb-2.5">
        <div className="relative w-full" style={{ aspectRatio: "9/11" }}>
          <div
            className="w-full h-full rounded-xl border border-border flex items-center justify-center"
            style={{
              background: `repeating-linear-gradient(135deg, hsl(var(--muted)) 0 8px, hsl(var(--background)) 8px 16px)`,
            }}
          >
            <div
              className="w-16 h-16 rounded-full animate-spin"
              style={{
                border: "3px solid hsl(var(--border))",
                borderTopColor: "hsl(var(--primary))",
              }}
            />
          </div>
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-full text-[11px] border border-border bg-background/80">
              {pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress number + bar */}
      <div className="px-5 pb-2.5">
        <div className="flex justify-between items-baseline mb-2">
          <div className="flex items-baseline gap-1">
            <span
              className="font-extrabold text-primary leading-none"
              style={{ fontSize: 40, letterSpacing: "-1.5px", lineHeight: 1 }}
            >
              {pct}
            </span>
            <span className="text-lg text-muted-foreground font-semibold">%</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {pipelineStatus === "extracting" ? "Extracting frames…" : "Detecting poses…"}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden border border-border"
          style={{ background: "hsl(var(--muted))" }}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Pipeline checklist */}
      <div className="px-5 flex flex-col gap-2.5">
        {PIPELINE_STEPS.map((label, i) => {
          const state = getStepState(i, pipelineStatus);
          return (
            <div key={label} className="flex items-center gap-2.5">
              <div
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: state === "done" ? "hsl(var(--primary))" : "transparent",
                  border: `1.5px solid ${state !== "pending" ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                }}
              >
                {state === "done" && (
                  <span className="text-[10px] text-primary-foreground font-bold">✓</span>
                )}
                {state === "active" && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <span
                className={[
                  "text-[13px]",
                  state === "active" ? "font-semibold" : "font-medium",
                  state === "pending" ? "text-muted-foreground" : "",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Cancel */}
      <div className="px-4 pb-[18px]">
        <button
          type="button"
          onClick={onCancel}
          className="w-full h-11 rounded-xl text-muted-foreground text-[13px] font-semibold border border-dashed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AnalyzingScreen;
