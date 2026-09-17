"use client";

import { useMemo } from "react";

import { usePrograms } from "@/hooks/usePrograms";
import { buildActivityIndex } from "@/features/workout-grid/model/activity-index";
import { buildMonthLabels } from "@/features/workout-grid/model/axis-labels";
import { buildGridWindow, WEEKS } from "@/features/workout-grid/model/grid-window";
import { GridCell } from "./GridCell";

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

export function WorkoutGrid() {
  const { data: programs } = usePrograms();

  const weeks = useMemo(() => {
    const timeZone = resolveTimeZone();
    const index = buildActivityIndex(programs ?? [], timeZone);
    return buildGridWindow(Date.now(), timeZone, index);
  }, [programs]);

  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);

  return (
    <section className="px-4 pt-[14px]">
      <div className="rounded-[14px] border border-[var(--yd-line)] bg-[var(--yd-surface)] p-3">
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
                  {week.map((cell, dayIndex) =>
                    cell === null ? (
                      // 창 밖 자리는 버튼이 아니라 빈 칸이다 (spec 경계: 잘린 주).
                      <div key={dayIndex} className="aspect-square w-full" />
                    ) : (
                      <GridCell
                        key={cell.dateKey}
                        dateKey={cell.dateKey}
                        state={cell.state}
                        isToday={cell.isToday}
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
