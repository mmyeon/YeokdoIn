"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { ROUTES } from "@/routes";
import { usePrograms } from "@/hooks/usePrograms";
import { buildActivityIndex } from "@/features/workout-grid/model/activity-index";
import { buildMonthLabels } from "@/features/workout-grid/model/axis-labels";
import { buildGridWindow, WEEKS } from "@/features/workout-grid/model/grid-window";
import { GridCell } from "./GridCell";
import { GridDayDetail } from "./GridDayDetail";

/**
 * 최근 26주 훈련 그리드.
 *
 * **이 그리드는 읽기 전용이다.** 여기서 훈련을 기록하거나 수정하지 않는다.
 * 나중에 칸에 쓰기 동작을 붙이려는 시도가 나오면 plan.md 의 스파이크 실측을
 * 근거로 막아야 한다 — 26열에서 오탭률이 35% 이고, 그 수치를 감당 가능하게
 * 만드는 유일한 이유가 "오탭의 결과가 무해하다"는 것이기 때문이다.
 *
 * 계산은 전부 model 레이어가 한다. 이 컴포넌트는 그리기만 한다.
 * 새 쿼리를 만들지 않고 홈이 이미 부르는 `usePrograms()` 의 캐시를 그대로 쓴다
 * (research R1) — 같은 행을 한 화면에서 두 번 받으면 무효화 버그의 자리가 생긴다.
 */

/** 요일 라벨 열의 폭. research R4 의 폭 계산이 이 값을 전제로 한다. */
const WEEKDAY_COLUMN_WIDTH = 14;

/** 세 칸 걸러 하나만 단다 — 10px 행에 일곱 글자를 넣으면 겹친다. */
const WEEKDAY_LABELS = ["월", "", "수", "", "금", "", ""] as const;

/** 브라우저 타임존. 날짜 경계를 정하는 값이라 model 에 주입한다 (research R2). */
function resolveTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** 세 상태가 같은 화면을 그리면 안 된다 (FR-009). 껍데기만 공유한다. */
function GridCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="px-4 pt-[14px]">
      <div className="rounded-[14px] border border-[var(--yd-line)] bg-[var(--yd-surface)] p-3">
        {children}
      </div>
    </section>
  );
}

export function WorkoutGrid() {
  const { data: programs, isLoading, isError, refetch } = usePrograms();

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const { weeks, index, todayKey } = useMemo(() => {
    const timeZone = resolveTimeZone();
    const activityIndex = buildActivityIndex(programs ?? [], timeZone);
    // 전역 window 를 가리지 않도록 이름을 따로 둔다.
    const gridWeeks = buildGridWindow(Date.now(), timeZone, activityIndex);
    const today = gridWeeks.at(-1)?.find((cell) => cell.isToday)?.dateKey;

    return { weeks: gridWeeks, index: activityIndex, todayKey: today ?? "" };
  }, [programs]);

  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);
  const isEmpty = (programs?.length ?? 0) === 0;

  // 선택 전 기본값은 오늘이다. 자리를 비워두면 누를 때마다 레이아웃이 튄다(R5).
  const shownDateKey = selectedDateKey ?? todayKey;

  if (isLoading) {
    // 홈의 HomeSkeleton 과 같은 톤. 빈 그리드처럼 보이면 안 된다.
    return (
      <GridCard>
        <div className="h-[92px] animate-pulse rounded-[8px] bg-[var(--yd-elevated)]" />
      </GridCard>
    );
  }

  if (isError) {
    // 빈 그리드로 위장하지 않는다 (FR-009). 조회가 실패했다는 사실을 그대로 말한다.
    return (
      <GridCard>
        <div className="flex flex-col items-start gap-2">
          <p className="text-[12px] text-[var(--yd-text-muted)]">
            훈련 기록을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-[8px] border border-[var(--yd-line-strong)] px-2.5 py-1 text-[11px] font-semibold text-[var(--yd-text)]"
          >
            다시 시도
          </button>
        </div>
      </GridCard>
    );
  }

  return (
    <GridCard>
      <div>
        <div className="flex gap-[2px]">
          {/* 요일 라벨. 그리드와 같은 7행으로 나눠 높이를 맞춘다. */}
          <div
            aria-hidden
            className="grid shrink-0 grid-rows-7 gap-[2px] pt-[14px]"
            style={{ width: WEEKDAY_COLUMN_WIDTH }}
          >
            {WEEKDAY_LABELS.map((label, row) => (
              <span
                key={row}
                className="flex items-center text-[7px] leading-none text-[var(--yd-text-dim)]"
              >
                {label}
              </span>
            ))}
          </div>

          {/* min-w-0 가 있어야 1fr 열이 내용 폭으로 밀려나지 않는다 (FR-006). */}
          <div className="min-w-0 flex-1">
            <div
              aria-hidden
              className="grid h-[14px] gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}
            >
              {monthLabels.map(({ weekIndex, label }) => (
                <span
                  key={weekIndex}
                  className="whitespace-nowrap text-[8px] leading-none text-[var(--yd-text-dim)]"
                  style={{ gridColumnStart: weekIndex + 1 }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              className="grid gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}
            >
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-[2px]">
                  {week.map((cell) => (
                    <GridCell
                      key={cell.dateKey}
                      dateKey={cell.dateKey}
                      state={cell.state}
                      isToday={cell.isToday}
                      isSelected={cell.dateKey === selectedDateKey}
                      onSelect={setSelectedDateKey}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {shownDateKey && (
          <GridDayDetail
            dateKey={shownDateKey}
            activity={index.get(shownDateKey)}
          />
        )}

        {/* 기록이 0건이면 칸을 켜는 방법을 알려준다 (FR-009).
            오류가 아니라 아직 시작하지 않은 상태다. */}
        {isEmpty && (
          <Link
            href={ROUTES.TRAINING.PROGRAM_INPUT}
            className="mt-2.5 block text-[11px] text-[var(--yd-text-muted)]"
          >
            아직 기록이 없어요.{" "}
            <span className="font-semibold text-[var(--yd-primary)]">
              프로그램을 입력하면
            </span>{" "}
            그날 칸이 켜져요.
          </Link>
        )}
      </div>
    </GridCard>
  );
}
