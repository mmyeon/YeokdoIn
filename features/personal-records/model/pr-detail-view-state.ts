/**
 * PR 상세 화면이 무엇을 그릴지 판정하는 순수 함수.
 *
 * 이 화면에는 서로 다른 세 상태가 있다 — **아직 모른다**(인증 미확정이거나 조회 중),
 * **없다**, **있다**. 셋을 둘로 뭉개면 "모른다"가 "없다"로 새어나가 사용자에게
 * '기록을 찾을 수 없습니다'가 먼저 번쩍이고, 그 다음 빈 상세가 깜빡이고, 다시
 * 없다로 돌아가는 3단 깜빡임이 생긴다.
 *
 * 주의: 판정에 React Query의 `isLoading` 을 쓰면 안 된다. `usePersonalRecords` 는
 * `enabled: !!user` 라 인증 확정 전에는 쿼리가 꺼져 있고, 꺼진 쿼리의 `isLoading` 은
 * `false`(fetchStatus가 'idle'이므로)다. "데이터가 아직 없다"를 뜻하는 `isPending` 을
 * 넘겨야 한다.
 *
 * I/O·React 의존 없음.
 */

export type PRDetailViewState = "loading" | "not-found" | "ready";

export type PRDetailViewInput = {
  /** React Query `isPending` — 데이터가 아직 없으면 true (쿼리가 꺼진 경우 포함) */
  isRecordPending: boolean;
  hasRecord: boolean;
};

export function resolvePRDetailViewState({
  isRecordPending,
  hasRecord,
}: PRDetailViewInput): PRDetailViewState {
  // 캐시에 이미 있으면 재조회 중이어도 보여준다.
  if (hasRecord) return "ready";
  if (isRecordPending) return "loading";
  return "not-found";
}
