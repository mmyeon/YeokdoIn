"use client";

import { useEffect, useState } from "react";

import { isSameLocalDay } from "@/features/workout-grid/model/local-date-key";

/** 자정을 넘긴 것을 알아채기까지 허용하는 지연. 판정 자체는 값싸다. */
const DAY_CHECK_INTERVAL_MS = 60_000;

/**
 * 날이 바뀔 때만 값이 바뀌는 "현재 시각".
 *
 * 그리드가 `Date.now()` 를 렌더 중에 한 번 읽고 마는 구조였을 때의 버그를 막는다.
 * `usePrograms()` 를 다시 조회해도 행이 그대로면 React Query 의 structural
 * sharing 이 **이전 배열 객체를 그대로 재사용**하므로, `[programs]` 에 걸린
 * memo 는 다시 돌지 않는다. 앱을 켜둔 채 날이 바뀌면 어제 칸에 오늘 표시가
 * 남고 오늘 칸이 `'future'` 로 그려진다. 데이터가 아니라 시각이 고인 것이라
 * 쿼리 쪽을 아무리 손봐도 해결되지 않는다.
 *
 * 같은 날이면 **이전 값을 그대로 반환해** 리렌더를 만들지 않는다. 그리드는
 * 182칸을 다시 그리는 물건이라 1분마다 흔들면 안 된다.
 *
 * 깨우는 신호가 둘인 이유:
 * - `visibilitychange` — 백그라운드에 있다가 돌아온 순간 즉시 바로잡는다.
 *   모바일에서 백그라운드 타이머는 심하게 조여지거나 아예 멈추기 때문이다.
 * - 주기 점검 — 화면을 켜둔 채 자정을 넘기는 경우(체육관에서 흔하다)는
 *   포커스 이벤트가 아예 발생하지 않는다.
 *
 * @param timeZone IANA 타임존 이름 — 날짜 경계를 정한다
 */
export function useDayTick(timeZone: string): number {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const sync = () => {
      setNowMs((previous) => {
        const next = Date.now();
        return isSameLocalDay(previous, next, timeZone) ? previous : next;
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") sync();
    };

    const timer = window.setInterval(sync, DAY_CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [timeZone]);

  return nowMs;
}
