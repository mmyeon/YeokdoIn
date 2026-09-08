import { maxAcceptablePRDate } from "../pr-date-bounds";

/** 2026-09-08 05:00 KST = 2026-09-07 20:00 UTC */
const KST_DAWN = Date.parse("2026-09-08T05:00:00+09:00");

describe("maxAcceptablePRDate", () => {
  it("UTC 기준 어제여도 한국 새벽에 고른 오늘 날짜를 허용한다", () => {
    // 서버가 UTC로 '오늘'을 계산하면 2026-09-07이라 오늘 기록이 거부됐다.
    expect(new Date(KST_DAWN).toISOString().slice(0, 10)).toBe("2026-09-07");

    expect(maxAcceptablePRDate(KST_DAWN)).toBe("2026-09-08");
  });

  it("지구상 가장 빠른 타임존(UTC+14)의 오늘까지 허용한다", () => {
    // 2026-09-08 00:00 UTC → 키리바시는 이미 2026-09-08 14:00
    const utcMidnight = Date.parse("2026-09-08T00:00:00Z");

    expect(maxAcceptablePRDate(utcMidnight)).toBe("2026-09-08");
  });

  it("UTC 오전 11시를 넘기면 상한이 다음 날로 넘어간다", () => {
    // UTC+14 지역이 이미 다음 날에 들어선 시점
    const utcLate = Date.parse("2026-09-08T11:00:00Z");

    expect(maxAcceptablePRDate(utcLate)).toBe("2026-09-09");
  });

  it("어떤 시각이든 UTC 오늘보다 하루 이상 앞서지 않는다", () => {
    const samples = [
      "2026-01-01T00:00:00Z",
      "2026-06-15T09:59:59Z",
      "2026-12-31T23:59:59Z",
    ].map(Date.parse);

    for (const ms of samples) {
      const utcToday = new Date(ms).toISOString().slice(0, 10);
      const bound = maxAcceptablePRDate(ms);
      const gapDays =
        (Date.parse(bound) - Date.parse(utcToday)) / (24 * 60 * 60 * 1000);

      expect(gapDays).toBeGreaterThanOrEqual(0);
      expect(gapDays).toBeLessThanOrEqual(1);
    }
  });

  it("연말 경계에서도 날짜가 깨지지 않는다", () => {
    expect(maxAcceptablePRDate(Date.parse("2026-12-31T20:00:00Z"))).toBe(
      "2027-01-01"
    );
  });
});
