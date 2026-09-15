/**
 * 서버가 쓰는 PR 날짜 상한 — 순수 함수.
 *
 * `pr_date` 는 시각이 아니라 **사용자 달력의 날짜**다. "내가 며칠에 이 무게를
 * 들었나"는 그 사람이 사는 달력의 개념이므로 판정 기준도 사용자 로컬 날짜여야
 * 하고, UI(`PRHistoryEntryEditor`)가 브라우저 타임존으로 그 일을 한다.
 *
 * 문제는 서버가 요청자의 타임존을 모른다는 것이다. 서버가 UTC로 "오늘"을 잡으면
 * 한국 새벽(00:00~09:00 KST)에는 UTC가 아직 어제라, 사용자가 오늘 날짜로 등록한
 * 기록이 "미래 날짜"로 거부된다.
 *
 * 그래서 서버는 **지구 어디서도 미래일 수 없는 날짜**만 거부한다. 지구상 가장
 * 빠른 표준시가 UTC+14(키리바시)이므로 그만큼 여유를 준다. 연도·월 오타 같은
 * 큰 실수는 그대로 걸리고, 하루 차이의 회색지대는 UI가 담당한다.
 *
 * 클라이언트가 자기 타임존을 보내게 하지 않는 이유: 그 값을 서버가 믿는 순간
 * 서버 검증이 클라이언트 검증과 같아진다.
 */

/** 지구상 최대 UTC 오프셋 (키리바시 라인 제도). */
const MAX_UTC_OFFSET_HOURS = 14;

const HOUR_MS = 60 * 60 * 1000;

/**
 * @param nowMs 현재 시각 (epoch ms). 호출자가 주입한다
 * @returns `YYYY-MM-DD` — 이보다 뒤인 `pr_date` 는 어느 타임존에서도 미래다
 */
export function maxAcceptablePRDate(nowMs: number): string {
  return new Date(nowMs + MAX_UTC_OFFSET_HOURS * HOUR_MS)
    .toISOString()
    .slice(0, 10);
}
