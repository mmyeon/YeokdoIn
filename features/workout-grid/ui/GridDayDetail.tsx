"use client";

import Link from "next/link";

import { ROUTES } from "@/routes";
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
 * **기록 한 건당 한 줄이고 본문은 펼치지 않는다.** 홈은 글랜스 화면이라 본문을
 * 펼치면 하루 3건에 상세가 그리드보다 길어져 아래 섹션이 화면 밖으로 밀린다.
 * 본문은 기록 상세 화면에 이미 온전히 있으므로 링크로 보낸다(spec 결정 기록).
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
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-semibold text-[var(--yd-text)]">
          {formatDate(dateKey)}
        </p>
        {activity && (
          <span className="shrink-0 text-[10px] text-[var(--yd-text-dim)]">
            {activity.count}건
          </span>
        )}
      </div>

      {activity ? (
        <ul className="mt-1 flex flex-col">
          {activity.programs.map((program) => (
            <li key={program.id}>
              <ProgramRow program={program} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-0.5 text-[11px] text-[var(--yd-text-muted)]">
          훈련 기록 없음
        </p>
      )}
    </div>
  );
}

/**
 * 한 건 = 한 줄. 넘치는 글자는 말줄임으로 자른다 — 줄 수가 건수와 같아야
 * 상세 높이가 예측 가능하고 홈이 밀리지 않는다.
 *
 * `label` 이 `null` 인 줄도 링크는 살린다. 이름을 못 찾은 것이지 기록이 없는
 * 게 아니므로, 눌러서 본문을 확인할 길을 막으면 안 된다.
 */
function ProgramRow({ program }: { program: DayProgram }) {
  return (
    <Link
      href={ROUTES.TRAINING.PROGRAM_DETAIL(program.id)}
      className="flex items-center gap-1 py-[3px] text-[11px]"
    >
      <span
        className={`truncate ${
          program.label
            ? "text-[var(--yd-text)]"
            : "text-[var(--yd-text-dim)]"
        }`}
      >
        {program.label ?? "제목 없는 기록"}
      </span>
      {/* 화살표는 "누를 수 있다"는 유일한 신호다. dim 은 라이트 테마에서
          배경에 묻혀 링크로 안 읽혔다 — muted 로 올린다 (dogfooding 2026-09-18). */}
      <span
        aria-hidden
        className="ml-auto shrink-0 text-[13px] leading-none text-[var(--yd-text-muted)]"
      >
        ›
      </span>
    </Link>
  );
}
