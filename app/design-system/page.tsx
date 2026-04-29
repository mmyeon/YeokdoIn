import { Dumbbell, Play, Settings as SettingsIcon, Plus } from "lucide-react";

import { Barbell } from "@/components/ui/barbell";
import { Button } from "@/components/ui/button";
import { Fab } from "@/components/ui/fab";
import { Pill } from "@/components/ui/pill";
import { SetDot } from "@/components/ui/set-dot";
import { TabBar } from "@/components/ui/tab-bar";

export const metadata = {
  title: "YeokdoIn Design System",
};

/* ---------- primitives local to this preview page ---------- */

function Swatch({
  name,
  variable,
  note,
  fg = "var(--yd-text)",
}: {
  name: string;
  variable: string;
  note?: string;
  fg?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex h-[72px] items-end rounded-[var(--yd-r-md)] border border-yd-line p-2.5"
        style={{ background: `var(${variable})`, color: fg }}
      >
        <span
          className="opacity-75"
          style={{ fontFamily: "var(--yd-font-mono)", fontSize: 11 }}
        >
          {variable}
        </span>
      </div>
      <div>
        <div className="font-semibold" style={{ font: "var(--yd-t-body-s)", fontWeight: 600 }}>
          {name}
        </div>
        {note && (
          <div
            className="mt-0.5 uppercase text-yd-text-dim"
            style={{ font: "var(--yd-t-caption)", letterSpacing: "0.1em" }}
          >
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

function ThemedFoundations({ theme }: { theme: "dark" | "light" }) {
  return (
    <div
      data-theme={theme}
      className="rounded-[var(--yd-r-lg)] border border-yd-line bg-yd-bg text-yd-text"
      style={{ padding: "var(--yd-s-5)" }}
    >
      <div className="mb-5 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: theme === "dark" ? "#B4FF39" : "#3F8A00" }}
        />
        <span
          className="uppercase text-yd-text-dim"
          style={{ font: "var(--yd-t-caption)", letterSpacing: "0.16em" }}
        >
          {theme} theme
        </span>
      </div>

      <SubLabel>Surfaces</SubLabel>
      <Grid cols={4}>
        <Swatch name="Background" variable="--yd-bg" note="App" />
        <Swatch name="Surface" variable="--yd-surface" note="Card" />
        <Swatch name="Elevated" variable="--yd-elevated" note="Modal / Sheet" />
        <Swatch name="Line" variable="--yd-line-strong" note="Border" />
      </Grid>

      <SubLabel>Brand & Semantic</SubLabel>
      <Grid cols={4}>
        <Swatch name="Primary" variable="--yd-primary" fg="var(--yd-on-primary)" note="Action / CTA" />
        <Swatch name="PR" variable="--yd-pr" fg="var(--yd-on-pr)" note="Achievement" />
        <Swatch name="Success" variable="--yd-success" fg="var(--yd-on-success)" note="Complete (Teal)" />
        <Swatch name="Info" variable="--yd-info" fg="var(--yd-on-info)" note="Coach · Note" />
      </Grid>
      <Grid cols={4} style={{ marginTop: "var(--yd-s-3)" }}>
        <Swatch name="Warn" variable="--yd-warn" fg="var(--yd-on-warn)" note="Near failure" />
        <Swatch name="Error" variable="--yd-error" fg="var(--yd-on-error)" note="Failed / Destructive" />
        <Swatch name="Primary Subtle" variable="--yd-primary-subtle" fg="var(--yd-primary)" note="Tint bg" />
        <Swatch name="PR Subtle" variable="--yd-pr-subtle" fg="var(--yd-pr)" note="Banner bg" />
      </Grid>

      <SubLabel>RPE Spectrum</SubLabel>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}
      >
        <Swatch name="RPE 6" variable="--yd-rpe-6" fg="#0a0b0c" note="Easy" />
        <Swatch name="RPE 7" variable="--yd-rpe-7" fg="#0a0b0c" note="Moderate" />
        <Swatch name="RPE 8" variable="--yd-rpe-8" fg="#0a0b0c" note="Hard" />
        <Swatch name="RPE 9" variable="--yd-rpe-9" fg="#0a0b0c" note="Grinding" />
        <Swatch name="RPE 10" variable="--yd-rpe-10" fg="#fff" note="Maximal" />
      </div>

      <SubLabel>Text</SubLabel>
      <div className="flex flex-col gap-2">
        <div style={{ color: "var(--yd-text)", font: "var(--yd-t-h2)" }}>
          Primary text — 22/600
        </div>
        <div style={{ color: "var(--yd-text-muted)", font: "var(--yd-t-body)" }}>
          Muted — supporting details, labels, secondary info
        </div>
        <div
          style={{
            color: "var(--yd-text-dim)",
            font: "var(--yd-t-body-s)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Dim — meta, eyebrows, timestamps
        </div>
      </div>
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="uppercase text-yd-text-dim"
      style={{
        font: "var(--yd-t-caption)",
        letterSpacing: "0.14em",
        margin: "var(--yd-s-6) 0 var(--yd-s-3)",
      }}
    >
      {children}
    </div>
  );
}

function Grid({
  cols = 2,
  children,
  style,
}: {
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="grid"
      style={{
        gap: "var(--yd-s-4)",
        gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Panel({
  title,
  tag,
  children,
}: {
  title: string;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[var(--yd-r-lg)] border border-yd-line bg-yd-surface"
      style={{ padding: "var(--yd-s-5)" }}
    >
      <div
        className="flex items-baseline justify-between"
        style={{ marginBottom: "var(--yd-s-4)" }}
      >
        <h3
          className="font-semibold tracking-tight text-yd-text"
          style={{ font: "var(--yd-t-h3)", margin: 0 }}
        >
          {title}
        </h3>
        {tag && (
          <span
            className="uppercase text-yd-text-dim"
            style={{ font: "var(--yd-t-caption)", letterSpacing: "0.14em" }}
          >
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SpecRow({ spec, sample }: { spec: string; sample: React.ReactNode }) {
  return (
    <div
      className="grid items-baseline border-b border-dashed border-yd-line"
      style={{
        gridTemplateColumns: "1fr 260px",
        gap: "var(--yd-s-4)",
        paddingBottom: "var(--yd-s-3)",
      }}
    >
      <div>{sample}</div>
      <div
        className="text-right text-yd-text-dim"
        style={{ font: "var(--yd-t-body-s)", fontFamily: "var(--yd-font-mono)" }}
      >
        {spec}
      </div>
    </div>
  );
}

/* ---------- section: foundations ---------- */

function Foundations() {
  return (
    <Section label="01 · Foundations" title="Tokens" meta="CSS variables · both themes">
      <Grid cols={2}>
        <ThemedFoundations theme="dark" />
        <ThemedFoundations theme="light" />
      </Grid>

      <div style={{ height: "var(--yd-s-6)" }} />

      <Grid cols={2}>
        <TypographyPanel />
        <div className="flex flex-col" style={{ gap: "var(--yd-s-4)" }}>
          <SpacingPanel />
          <RadiusPanel />
        </div>
      </Grid>

      <div style={{ height: "var(--yd-s-4)" }} />

      <Grid cols={2}>
        <ElevationPanel />
        <MotionPanel />
      </Grid>
    </Section>
  );
}

function TypographyPanel() {
  return (
    <Panel title="Type scale" tag="geist · geist mono">
      <div className="grid" style={{ gap: "var(--yd-s-4)" }}>
        <SpecRow
          spec="display · 40/1.05 · 600"
          sample={
            <div style={{ font: "var(--yd-t-display)", letterSpacing: "-0.02em" }}>
              Snatch 120kg
            </div>
          }
        />
        <SpecRow
          spec="h1 · 28/1.15 · 600"
          sample={
            <div style={{ font: "var(--yd-t-h1)", letterSpacing: "-0.01em" }}>
              Today&apos;s Training
            </div>
          }
        />
        <SpecRow
          spec="h2 · 22/1.2 · 600"
          sample={<div style={{ font: "var(--yd-t-h2)" }}>Clean &amp; Jerk</div>}
        />
        <SpecRow
          spec="h3 · 17/1.3 · 600"
          sample={<div style={{ font: "var(--yd-t-h3)" }}>Working sets</div>}
        />
        <SpecRow
          spec="body · 15/1.5 · 400"
          sample={
            <div style={{ font: "var(--yd-t-body)" }}>
              Focus on bar path — keep it close through the pull.
            </div>
          }
        />
        <SpecRow
          spec="caption · 11/1.3 · 500 · 0.12em"
          sample={
            <div
              style={{
                font: "var(--yd-t-caption)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--yd-text-dim)",
              }}
            >
              Rest · 2:00
            </div>
          }
        />
        <div className="my-2 h-px bg-yd-line" />
        <SpecRow
          spec="num-xl · mono · 56/1 · 600 · tabular"
          sample={
            <div
              className="yd-num"
              style={{ font: "var(--yd-t-num-xl)", letterSpacing: "-0.02em" }}
            >
              142
              <span
                style={{ color: "var(--yd-text-dim)", fontSize: 20, marginLeft: 4 }}
              >
                kg
              </span>
            </div>
          }
        />
        <SpecRow
          spec="num-lg · mono · 32/1"
          sample={<div className="yd-num" style={{ font: "var(--yd-t-num-lg)" }}>80% × 2 × 3</div>}
        />
        <SpecRow
          spec="num-md · mono · 20/1"
          sample={<div className="yd-num" style={{ font: "var(--yd-t-num-md)" }}>05:00 → 03:42</div>}
        />
        <SpecRow
          spec="notation · mono · 14/1.4"
          sample={
            <div style={{ font: "var(--yd-t-notation)" }}>
              <span style={{ color: "var(--yd-primary)" }}>SN</span>{" "}
              <span style={{ color: "var(--yd-info)" }}>80%</span>
              <span style={{ color: "var(--yd-text-dim)" }}>×</span>2
              <span style={{ color: "var(--yd-text-dim)" }}>×</span>
              <span style={{ color: "var(--yd-warn)" }}>3</span>
            </div>
          }
        />
      </div>
    </Panel>
  );
}

function SpacingPanel() {
  const steps: ReadonlyArray<[string, string]> = [
    ["--yd-s-1", "4px"],
    ["--yd-s-2", "8px"],
    ["--yd-s-3", "12px"],
    ["--yd-s-4", "16px"],
    ["--yd-s-5", "24px"],
    ["--yd-s-6", "32px"],
    ["--yd-s-7", "48px"],
    ["--yd-s-8", "64px"],
  ];
  return (
    <Panel title="Spacing · 4px base" tag="8 steps">
      <div className="flex flex-col gap-2.5">
        {steps.map(([name, px]) => (
          <div
            key={name}
            className="grid items-center gap-3"
            style={{ gridTemplateColumns: "80px 1fr 80px" }}
          >
            <code className="bg-transparent p-0 text-yd-text-muted">{name}</code>
            <div
              className="h-3 rounded-[2px] bg-yd-primary"
              style={{ width: px }}
            />
            <div
              className="text-right text-yd-text-muted"
              style={{ font: "var(--yd-t-body-s)", fontFamily: "var(--yd-font-mono)" }}
            >
              {px}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RadiusPanel() {
  const steps: ReadonlyArray<[string, string, number]> = [
    ["--yd-r-sm", "6", 6],
    ["--yd-r-md", "10", 10],
    ["--yd-r-lg", "16", 16],
    ["--yd-r-xl", "22", 22],
    ["--yd-r-full", "999", 999],
  ];
  return (
    <Panel title="Radius" tag="5 levels">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}
      >
        {steps.map(([name, px, radius]) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div
              className="bg-yd-primary-soft"
              style={{
                width: 76,
                height: 76,
                border: "1px solid color-mix(in oklab, var(--yd-primary) 40%, transparent)",
                borderRadius: radius,
              }}
            />
            <code className="bg-transparent p-0 text-yd-text-muted">{name}</code>
            <div
              className="text-yd-text-dim"
              style={{ font: "var(--yd-t-caption)", fontFamily: "var(--yd-font-mono)" }}
            >
              {px}px
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ElevationPanel() {
  return (
    <Panel title="Elevation" tag="inset + drop">
      <Grid cols={3}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex flex-col items-center justify-center gap-1 rounded-[var(--yd-r-lg)] border border-yd-line bg-yd-elevated"
            style={{ height: 120, boxShadow: `var(--yd-shadow-${n})` }}
          >
            <div style={{ font: "var(--yd-t-num-md)", fontFamily: "var(--yd-font-mono)" }}>
              0{n}
            </div>
            <div
              className="uppercase text-yd-text-dim"
              style={{ font: "var(--yd-t-caption)", letterSpacing: "0.14em" }}
            >
              {n === 1 ? "Card · Rest" : n === 2 ? "Card · Hover" : "Modal · Overlay"}
            </div>
          </div>
        ))}
      </Grid>
    </Panel>
  );
}

function MotionPanel() {
  const items: ReadonlyArray<[string, string, string]> = [
    ["--yd-dur-fast", "120ms", "Micro feedback"],
    ["--yd-dur-base", "200ms", "Transitions"],
    ["--yd-dur-slow", "360ms", "Scene change"],
  ];
  return (
    <Panel title="Motion" tag="duration · easing">
      <Grid cols={3}>
        {items.map(([name, val, note]) => (
          <div
            key={name}
            className="rounded-[var(--yd-r-md)] border border-yd-line"
            style={{ padding: 14 }}
          >
            <div style={{ font: "var(--yd-t-num-md)", fontFamily: "var(--yd-font-mono)" }}>
              {val}
            </div>
            <div
              className="mt-1 uppercase text-yd-text-dim"
              style={{ font: "var(--yd-t-caption)", letterSpacing: "0.14em" }}
            >
              {name}
            </div>
            <div
              className="mt-2 text-yd-text-muted"
              style={{ font: "var(--yd-t-body-s)" }}
            >
              {note}
            </div>
          </div>
        ))}
      </Grid>
      <div
        className="mt-4 grid gap-3"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <div
          className="rounded-[var(--yd-r-md)] border border-yd-line"
          style={{ padding: 14 }}
        >
          <div
            className="text-yd-text-muted"
            style={{ font: "var(--yd-t-body-s)" }}
          >
            ease-out <code>cubic-bezier(0.2, 0.7, 0.2, 1)</code>
          </div>
        </div>
        <div
          className="rounded-[var(--yd-r-md)] border border-yd-line"
          style={{ padding: 14 }}
        >
          <div
            className="text-yd-text-muted"
            style={{ font: "var(--yd-t-body-s)" }}
          >
            ease-spring <code>cubic-bezier(0.34, 1.4, 0.64, 1)</code>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ---------- section wrapper + components showcase ---------- */

function Section({
  label,
  title,
  meta,
  children,
}: {
  label: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: "var(--yd-s-8)" }}>
      <div
        className="flex items-baseline justify-between border-b border-yd-line"
        style={{ gap: "var(--yd-s-4)", paddingBottom: "var(--yd-s-3)", marginBottom: "var(--yd-s-5)" }}
      >
        <div>
          <div
            className="uppercase text-yd-text-dim"
            style={{ font: "var(--yd-t-caption)", letterSpacing: "0.18em" }}
          >
            {label}
          </div>
          <h2
            className="tracking-tight text-yd-text"
            style={{ font: "var(--yd-t-h1)", letterSpacing: "-0.01em", margin: 0 }}
          >
            {title}
          </h2>
        </div>
        {meta && (
          <div
            className="text-yd-text-muted"
            style={{ font: "var(--yd-t-body-s)", fontFamily: "var(--yd-font-mono)" }}
          >
            {meta}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

const PILL_TONES = ["neutral", "primary", "success", "warn", "error", "info", "pr"] as const;
const PILL_VARIANTS = ["outlined", "solid", "subtle"] as const;

const TAB_ITEMS = [
  { key: "workout", label: "Workout", href: "#workout", icon: Dumbbell },
  { key: "video", label: "Video", href: "#video", icon: Play },
  { key: "settings", label: "Settings", href: "#settings", icon: SettingsIcon },
] as const;

function Components() {
  return (
    <Section label="02 · Components" title="Kit" meta="shadcn + tailwind · yd tokens">
      <Grid cols={2}>
        <Panel title="Pill" tag="tone × variant × size">
          <div className="flex flex-col" style={{ gap: "var(--yd-s-4)" }}>
            {PILL_VARIANTS.map((variant) => (
              <div key={variant} className="flex flex-col gap-2">
                <div
                  className="uppercase text-yd-text-dim"
                  style={{ font: "var(--yd-t-caption)", letterSpacing: "0.14em" }}
                >
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
          </div>
        </Panel>

        <Panel title="SetDot" tag="complete / pending">
          <div className="flex flex-wrap items-center gap-4">
            <SetDot done={false} />
            <SetDot done />
            <SetDot done={false} size={36} />
            <SetDot done size={36} />
            <SetDot done size={48} />
          </div>
        </Panel>

        <Panel title="Buttons" tag="shadcn (yd-themed)">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </Panel>

        <Panel title="Fab" tag="floating action">
          <div className="relative flex h-32 items-center justify-around rounded-[var(--yd-r-md)] border border-dashed border-yd-line">
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
        </Panel>

        <Panel title="Barbell" tag="plate breakdown">
          <div className="flex flex-col" style={{ gap: "var(--yd-s-3)" }}>
            {[60, 102.5, 145].map((kg) => (
              <div key={kg} className="flex flex-col gap-1">
                <div
                  className="text-yd-text-muted"
                  style={{ font: "var(--yd-t-body-s)", fontFamily: "var(--yd-font-mono)" }}
                >
                  {kg} kg
                </div>
                <Barbell totalKg={kg} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="TabBar" tag="bottom navigation">
          <div className="relative h-20 overflow-hidden rounded-[var(--yd-r-md)] border border-dashed border-yd-line">
            <TabBar
              items={TAB_ITEMS}
              activeKey="workout"
              className="!absolute !inset-x-0 !bottom-0"
            />
          </div>
        </Panel>
      </Grid>
    </Section>
  );
}

/* ---------- page ---------- */

export default function DesignSystemPage() {
  return (
    <main
      className="min-h-screen bg-yd-bg text-yd-text"
      style={{ fontFamily: "var(--yd-font-sans)" }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 1200,
          padding: "var(--yd-s-7) var(--yd-s-5) var(--yd-s-8)",
        }}
      >
        <header
          className="grid items-end border-b border-yd-line"
          style={{
            gridTemplateColumns: "1fr auto",
            gap: "var(--yd-s-5)",
            paddingBottom: "var(--yd-s-5)",
            marginBottom: "var(--yd-s-7)",
          }}
        >
          <div>
            <div
              className="flex items-center uppercase text-yd-text-dim"
              style={{
                font: "var(--yd-t-caption)",
                letterSpacing: "0.12em",
                gap: "var(--yd-s-2)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-yd-primary"
                style={{ boxShadow: "0 0 0 3px var(--yd-primary-soft)" }}
              />
              YeokdoIn Design System · v0.2
            </div>
            <h1
              style={{
                font: "var(--yd-t-display)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Tokens &amp; Kit
            </h1>
            <p
              className="text-yd-text-muted"
              style={{
                maxWidth: "60ch",
                margin: "var(--yd-s-3) 0 0",
                font: "var(--yd-t-body)",
              }}
            >
              Foundation tokens (color, typography, spacing, radius, elevation, motion) and the
              Tailwind + shadcn component kit built on top of them.
            </p>
          </div>
          <div
            className="text-yd-text-muted"
            style={{
              font: "var(--yd-t-body-s)",
              fontFamily: "var(--yd-font-mono)",
            }}
          >
            dark primary · light secondary
          </div>
        </header>

        <Foundations />
        <Components />
      </div>
    </main>
  );
}
