"use client";

import type {
  DayActivity,
  DayProgram,
} from "@/features/workout-grid/model/types";

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

      {activity ? (
        <div className="mt-1 flex flex-col gap-2">
          {activity.programs.map((program, i) => (
            <ProgramSummary key={i} program={program} ordinal={i + 1} />
          ))}
        </div>
      ) : (
        <p className="mt-0.5 text-[11px] text-[var(--yd-text-muted)]">
          훈련 기록 없음
        </p>
      )}
    </div>
  );
}

/**
 * 프로그램 한 건을 줄 그대로 펼친다. 요약하거나 자르지 않는다 — 상세 자리는
 * 그리드 **아래**라 길어져도 그리드가 밀리지 않는다.
 *
 * 제목이 없으면 여러 건일 때 서로를 구분할 이름이 없으므로 순번을 머리글로 쓴다.
 */
function ProgramSummary({
  program,
  ordinal,
}: {
  program: DayProgram;
  ordinal: number;
}) {
  const heading = program.title ?? `프로그램 ${ordinal}`;

  return (
    <div>
      <p className="text-[10px] font-semibold text-[var(--yd-text-muted)]">
        {heading}
      </p>
      {program.lines.length > 0 ? (
        <ul className="mt-0.5 flex flex-col gap-0.5">
          {program.lines.map((line, i) => (
            <li key={i} className="text-[11px] text-[var(--yd-text)]">
              {line}
            </li>
          ))}
        </ul>
      ) : (
        // 칸이 켜진 이유는 기록이 있어서다. 내용이 비었어도 그 사실을 말한다.
        <p className="mt-0.5 text-[11px] text-[var(--yd-text-dim)]">
          입력된 내용 없음
        </p>
      )}
    </div>
  );
}
