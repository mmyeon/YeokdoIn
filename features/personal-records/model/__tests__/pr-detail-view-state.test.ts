import { resolvePRDetailViewState } from "@/features/personal-records/model/pr-detail-view-state";

describe("resolvePRDetailViewState", () => {
  it("조회가 끝나지 않았으면 loading이다", () => {
    expect(
      resolvePRDetailViewState({ isRecordPending: true, hasRecord: false })
    ).toBe("loading");
  });

  // 회귀 방지: `usePersonalRecords` 는 `enabled: !!user` 라 인증이 확정되기 전엔
  // 쿼리가 꺼져 있고, 이때 React Query의 `isLoading` 은 false다. 그 값을 그대로
  // 믿으면 "아직 모른다"를 "없다"로 오판해 '기록을 찾을 수 없습니다'가 먼저
  // 번쩍인다. 판정은 `isPending`(데이터 없음 = pending)으로 해야 한다.
  it("인증 미확정이라 쿼리가 꺼져 있어도 not-found로 단정하지 않는다", () => {
    expect(
      resolvePRDetailViewState({ isRecordPending: true, hasRecord: false })
    ).not.toBe("not-found");
  });

  it("조회가 끝났는데 기록이 없으면 not-found다", () => {
    expect(
      resolvePRDetailViewState({ isRecordPending: false, hasRecord: false })
    ).toBe("not-found");
  });

  it("기록이 있으면 ready다", () => {
    expect(
      resolvePRDetailViewState({ isRecordPending: false, hasRecord: true })
    ).toBe("ready");
  });

  it("아직 pending이어도 기록을 이미 찾았으면 ready다 (캐시 적중)", () => {
    expect(
      resolvePRDetailViewState({ isRecordPending: true, hasRecord: true })
    ).toBe("ready");
  });
});
