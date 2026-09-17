"use client";

import type { DayActivity } from "@/features/workout-grid/model/types";

/**
 * 선택한 날의 요약. 그리드 **바깥의 고정 자리**에 렌더한다.
 *
 * Dialog·Popover 를 쓰지 않는 이유는 research R5 다. FR-008 이 "이 표시는 홈의
 * 다른 조작을 막지 않는다"고 못 박았는데 Dialog 는 정의상 이를 위반하고,
 * Popover 는 신규 의존성이 필요한 데다 10px 셀에 앵커하면 가장자리 열에서
 * 위치 보정이 계속 문제가 된다. 고정 자리는 의존성 0, 위치 계산 0 이다.
 *
 * 선택 전에도 자리를 차지한다 — 비워두면 칸을 누를 때마다 레이아웃이 튄다.
 */

const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  const weekday = WEEKDAY_NAMES[new Date(`${dateKey}T00:00:00Z`).getUTCDay()];
  return `${Number(month)}월 ${Number(day)}일 (${weekday})`;
}

interface GridDayDetailProps {
  dateKey: string;
  /** 그날 활동. 없으면 `undefined` — 빈 문자열로 뭉개지 않는다 (FR-008) */
  activity: DayActivity | undefined;
}

export function GridDayDetail({ dateKey, activity }: GridDayDetailProps) {
  return (
    <div
      aria-live="polite"
      className="mt-2.5 min-h-[34px] border-t border-[var(--yd-line)] pt-2.5"
    >
      <p className="text-[11px] font-semibold text-[var(--yd-text)]">
        {formatDate(dateKey)}
      </p>
      <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--yd-text-muted)]">
        {activity ? summarize(activity) : "훈련 기록 없음"}
      </p>
    </div>
  );
}

/**
 * 이름이 있으면 이름을 먼저 보여준다 — 사용자가 알고 싶은 건 건수가 아니라
 * 그날 뭘 했는지다(FR-008). 한 건뿐이면 건수는 군더더기라 뺀다.
 *
 * 이름을 하나도 못 찾은 경우(제목도 lines 도 없는 기록)에만 건수로 물러선다.
 */
function summarize(activity: DayActivity): string {
  if (activity.titles.length === 0) return `프로그램 ${activity.count}건`;

  const names = activity.titles.join(", ");
  return activity.count > 1 ? `${activity.count}건 · ${names}` : names;
}
