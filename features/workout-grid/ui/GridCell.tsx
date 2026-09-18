"use client";

import type { CellState } from "@/features/workout-grid/model/types";

/**
 * 그리드 한 칸. **계산하지 않는다** — 상태는 model 이 정해서 내려준다.
 *
 * 켜짐/꺼짐을 색이 아니라 **채움 여부**로 구분한다(FR-010). 색상 차이가
 * 사라져도(흑백·색각 이상) 명도 대비로 남아야 하기 때문이다. 미래 칸은
 * 점선으로 꺼짐과도 구별한다 — 아직 판정할 수 없는 날이지 실패한 날이 아니다.
 *
 * 폭 제약(FR-006) 때문에 칸이 ~10px 라 WCAG 2.5.8 의 24px 타깃 기준을 만족할
 * 수 없다. 그래서 `<button>` 으로 두어 키보드·스크린리더 경로를 정확히 열어두고,
 * 오탭이 무해하도록 읽기 전용으로 설계한다(plan.md Complexity Tracking).
 */

interface GridCellProps {
  dateKey: string;
  state: CellState;
  isToday: boolean;
  isSelected?: boolean;
  onSelect?: (dateKey: string) => void;
}

const STATE_CLASS: Record<CellState, string> = {
  active: "border border-[var(--yd-primary)] bg-[var(--yd-primary)]",
  inactive: "border border-[var(--yd-line-strong)] bg-transparent",
  future: "border border-dashed border-[var(--yd-line)] bg-transparent",
};

const STATE_LABEL: Record<CellState, string> = {
  active: "훈련함",
  inactive: "훈련 없음",
  future: "아직 오지 않은 날",
};

export function formatCellLabel(dateKey: string, state: CellState): string {
  const [year, month, day] = dateKey.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일, ${STATE_LABEL[state]}`;
}

export function GridCell({
  dateKey,
  state,
  isToday,
  isSelected = false,
  onSelect,
}: GridCellProps) {
  return (
    <button
      type="button"
      aria-label={formatCellLabel(dateKey, state)}
      aria-pressed={isSelected}
      onClick={() => onSelect?.(dateKey)}
      className={[
        "aspect-square w-full rounded-[2px]",
        STATE_CLASS[state],
        isToday ? "outline outline-1 outline-offset-[1px] outline-[var(--yd-text)]" : "",
        isSelected ? "ring-1 ring-[var(--yd-primary-ring)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
