"use client";

import "jotai-devtools/styles.css";

import { useMemo } from "react";
import { usePrograms } from "@/hooks/usePrograms";
import { usePersonalRecords } from "@/hooks/usePersonalRecords";
import useAuth from "@/features/auth/model/useAuth";

import { HomeHeader } from "@/features/home/ui/HomeHeader";
import { SectionLabel } from "@/features/home/ui/SectionLabel";
import { FirstTimeHero } from "@/features/home/ui/FirstTimeHero";
import { IdleHero } from "@/features/home/ui/IdleHero";
import { PRBoard, type PRItem } from "@/features/home/ui/PRBoard";
import {
  ProgramLibraryPreview,
  type ProgramLibraryItem,
} from "@/features/home/ui/ProgramLibraryPreview";
import { VideoAnalysisCard } from "@/features/home/ui/VideoAnalysisCard";
import { ROUTES } from "@/routes";
import type { ProgramRow } from "@/features/programs/api/programs";
import type { PersonalRecordInfo } from "@/types/personalRecords";

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function formatDate(now: Date): string {
  return DATE_FORMATTER.format(now)
    .replace(/요일/, "요일 ·")
    .replace(/,/g, "");
}

function resolveInitial(name?: string | null, email?: string | null): string {
  const source = (name ?? email ?? "J").trim();
  return source.charAt(0).toUpperCase() || "J";
}

const PR_DISPLAY_ORDER: Array<{ keywords: string[]; label: string }> = [
  { keywords: ["인상", "snatch", "스내치"], label: "인상" },
  { keywords: ["용상", "clean", "저크"], label: "용상" },
  { keywords: ["스쿼트", "squat"], label: "백스쿼트" },
];

function toDisplayPRs(records: PersonalRecordInfo[] | undefined): PRItem[] {
  if (!records?.length) return [];
  return PR_DISPLAY_ORDER.flatMap(({ keywords, label }) => {
    const match = records.find((r) => {
      const name = r.exerciseName?.toLowerCase() ?? "";
      return keywords.some((k) => name.includes(k.toLowerCase()));
    });
    if (!match) return [];
    return [
      {
        name: label,
        kg: match.weight,
        fresh: isFresh(match.prDate),
      } satisfies PRItem,
    ];
  });
}

function isFresh(prDate: string | null | undefined): boolean {
  if (!prDate) return false;
  const diffMs = Date.now() - new Date(prDate).getTime();
  return diffMs >= 0 && diffMs <= 1000 * 60 * 60 * 24 * 3;
}

function toLibraryItems(programs: ProgramRow[]): ProgramLibraryItem[] {
  return programs.slice(0, 3).map((p, idx) => ({
    id: p.id,
    title: p.title ?? `프로그램 #${p.id}`,
    meta: new Date(p.created_at).toLocaleDateString("ko-KR"),
    pct: 0,
    active: idx === 0,
  }));
}

export default function Home() {
  const { user } = useAuth();
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: personalRecords, isLoading: prLoading } = usePersonalRecords();

  const now = useMemo(() => new Date(), []);
  const date = formatDate(now);
  const initial = resolveInitial(
    user?.user_metadata?.name,
    user?.email ?? null
  );
  const greeting = user?.user_metadata?.name
    ? `안녕하세요, ${user.user_metadata.name}`
    : "시작해볼까요";

  const isLoading = programsLoading || prLoading;
  const hasPrograms = (programs?.length ?? 0) > 0;
  const hasPRs = (personalRecords?.length ?? 0) > 0;
  const isFirstTime = !hasPrograms && !hasPRs;

  const prItems = toDisplayPRs(personalRecords);
  const libraryItems = hasPrograms ? toLibraryItems(programs!) : [];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-[var(--yd-bg)] pb-20 text-[var(--yd-text)]">
      <HomeHeader
        date={isFirstTime ? "환영합니다" : date}
        greeting={isFirstTime ? "시작해볼까요" : greeting}
        initial={initial}
        streak={!isFirstTime ? undefined : undefined}
      />

      {isLoading ? (
        <HomeSkeleton />
      ) : isFirstTime ? (
        <>
          <FirstTimeHero />
          <SectionLabel>자기 기록</SectionLabel>
          <PRBoard items={[]} variant="empty" />
        </>
      ) : (
        <>
          <IdleHero savedProgramsCount={programs?.length ?? 0} />

          <SectionLabel
            actionLabel="전체 ›"
            actionHref={ROUTES.SETTINGS.PERSONAL_RECORD}
          >
            자기 기록
          </SectionLabel>
          {prItems.length > 0 ? (
            <PRBoard items={prItems} />
          ) : (
            <PRBoard items={[]} variant="empty" />
          )}

          {libraryItems.length > 0 && (
            <>
              <SectionLabel
                actionLabel="전체 ›"
                actionHref={ROUTES.TRAINING.PROGRAM_INPUT}
              >
                프로그램 라이브러리
              </SectionLabel>
              <ProgramLibraryPreview items={libraryItems} />
            </>
          )}

          <SectionLabel>영상 분석</SectionLabel>
          <VideoAnalysisCard />
        </>
      )}
    </main>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-[14px]">
      <div className="h-48 animate-pulse rounded-[18px] border border-[var(--yd-line)] bg-[var(--yd-surface)]" />
      <div className="flex gap-2">
        <div className="h-20 flex-1 animate-pulse rounded-[14px] border border-[var(--yd-line)] bg-[var(--yd-surface)]" />
        <div className="h-20 flex-1 animate-pulse rounded-[14px] border border-[var(--yd-line)] bg-[var(--yd-surface)]" />
        <div className="h-20 flex-1 animate-pulse rounded-[14px] border border-[var(--yd-line)] bg-[var(--yd-surface)]" />
      </div>
    </div>
  );
}
