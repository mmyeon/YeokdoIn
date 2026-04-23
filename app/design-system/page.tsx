import { Dumbbell, Play, Settings as SettingsIcon, Plus } from "lucide-react";

import { Barbell } from "@/components/ui/barbell";
import { Button } from "@/components/ui/button";
import { Fab } from "@/components/ui/fab";
import { Pill } from "@/components/ui/pill";
import { SectionBanner } from "@/components/ui/section-banner";
import { SetDot } from "@/components/ui/set-dot";
import { TabBar } from "@/components/ui/tab-bar";

export const metadata = {
  title: "YeokdoIn Design System",
};

const PILL_TONES = ["neutral", "primary", "success", "warn", "error", "info", "pr"] as const;
const PILL_VARIANTS = ["outlined", "solid", "subtle"] as const;

const TAB_ITEMS = [
  { key: "workout", label: "Workout", href: "#workout", icon: Dumbbell },
  { key: "video", label: "Video", href: "#video", icon: Play },
  { key: "settings", label: "Settings", href: "#settings", icon: SettingsIcon },
] as const;

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-14 w-full rounded-md border border-yd-line"
        style={{ background: `var(${varName})` }}
      />
      <div className="text-[11px] font-medium text-yd-text">{name}</div>
      <div className="font-mono text-[10px] text-yd-text-muted">{varName}</div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-yd-text">{title}</h2>
      <div className="rounded-lg border border-yd-line bg-yd-surface p-6">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-yd-bg pb-32 text-yd-text">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
        <SectionBanner letter="Y" title="YeokdoIn Design System" sub="v0.2 — Token preview" />

        <Section id="tokens" title="Color tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            <Swatch name="bg" varName="--yd-bg" />
            <Swatch name="surface" varName="--yd-surface" />
            <Swatch name="elevated" varName="--yd-elevated" />
            <Swatch name="line" varName="--yd-line" />
            <Swatch name="text" varName="--yd-text" />
            <Swatch name="text-muted" varName="--yd-text-muted" />
            <Swatch name="primary" varName="--yd-primary" />
            <Swatch name="primary-subtle" varName="--yd-primary-subtle" />
            <Swatch name="success" varName="--yd-success" />
            <Swatch name="warn" varName="--yd-warn" />
            <Swatch name="error" varName="--yd-error" />
            <Swatch name="info" varName="--yd-info" />
            <Swatch name="pr" varName="--yd-pr" />
            <Swatch name="pr-subtle" varName="--yd-pr-subtle" />
            <Swatch name="rpe-6" varName="--yd-rpe-6" />
            <Swatch name="rpe-7" varName="--yd-rpe-7" />
            <Swatch name="rpe-8" varName="--yd-rpe-8" />
            <Swatch name="rpe-9" varName="--yd-rpe-9" />
            <Swatch name="rpe-10" varName="--yd-rpe-10" />
          </div>
        </Section>

        <Section id="pill" title="Pill">
          <div className="flex flex-col gap-5">
            {PILL_VARIANTS.map((variant) => (
              <div key={variant} className="flex flex-col gap-2">
                <div className="text-xs font-medium uppercase tracking-wide text-yd-text-muted">
                  {variant}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {PILL_TONES.map((tone) => (
                    <Pill key={tone} tone={tone} variant={variant}>
                      {tone}
                    </Pill>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-medium uppercase tracking-wide text-yd-text-muted">
                size
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="primary" variant="solid" size="sm">
                  sm
                </Pill>
                <Pill tone="primary" variant="solid" size="md">
                  md
                </Pill>
              </div>
            </div>
          </div>
        </Section>

        <Section id="set-dot" title="SetDot">
          <div className="flex flex-wrap items-center gap-4">
            <SetDot done={false} />
            <SetDot done />
            <SetDot done={false} size={36} />
            <SetDot done size={36} />
            <SetDot done size={48} />
          </div>
        </Section>

        <Section id="fab" title="Fab (rendered inline for preview)">
          <div className="relative flex h-40 items-center justify-around rounded-md border border-dashed border-yd-line">
            {/* Override `fixed` so previews stay scoped to this section */}
            <Fab className="!static !translate-x-0 shadow-none">
              <Plus />
            </Fab>
            <Fab tone="pr" className="!static !translate-x-0 shadow-none">
              <Plus />
            </Fab>
            <Fab size="sm" className="!static !translate-x-0 shadow-none">
              <Plus />
            </Fab>
          </div>
          <p className="mt-3 text-xs text-yd-text-muted">
            In real usage, <code className="font-mono">Fab</code> is fixed-positioned and floats
            above content.
          </p>
        </Section>

        <Section id="barbell" title="Barbell">
          <div className="flex flex-col gap-4">
            {[60, 80, 102.5, 145].map((kg) => (
              <div key={kg} className="flex flex-col gap-1">
                <div className="text-xs text-yd-text-muted">{kg} kg</div>
                <Barbell totalKg={kg} />
              </div>
            ))}
          </div>
        </Section>

        <Section id="buttons" title="Buttons (existing shadcn, now yd-themed)">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </Section>

        <Section id="tab-bar" title="TabBar (rendered inline for preview)">
          <div className="relative h-20 overflow-hidden rounded-md border border-dashed border-yd-line">
            <TabBar items={TAB_ITEMS} activeKey="workout" className="!absolute !inset-x-0 !bottom-0" />
          </div>
          <p className="mt-3 text-xs text-yd-text-muted">
            In real usage, <code className="font-mono">TabBar</code> is fixed to the viewport
            bottom.
          </p>
        </Section>
      </div>
    </main>
  );
}
