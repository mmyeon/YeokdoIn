/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import PRSparkline from "@/components/PersonalRecords/PRSparkline";
import { PRHistoryEntry } from "@/types/personalRecords";

/**
 * 좌표 계산 자체는 `features/personal-records/model/sparkline-plot.test.ts` 가
 * 덮는다. 여기서는 **컴포넌트가 어떤 기록 구성에서도 터지지 않고 그리는지**만 본다
 * (FR-017, 엣지케이스 "같은 날짜에 기록이 여러 건").
 */

function entry(
  id: number,
  prDate: string,
  newWeight: number
): PRHistoryEntry {
  return {
    id,
    exerciseId: 1,
    previousWeight: null,
    newWeight,
    prDate,
    note: null,
    source: "manual",
    createdAt: `${prDate}T00:00:00.000Z`,
  };
}

const EMPTY_MESSAGE = "기록이 2건 이상이면 그래프가 나타납니다.";

function pointCount(container: HTMLElement): number {
  return container.querySelectorAll("circle").length;
}

const LOADING_MESSAGE = "불러오는 중...";

describe("PRSparkline 로딩", () => {
  // 이력 조회가 끝나기 전에는 history가 빈 배열로 넘어온다. 그대로 그리면
  // '기록이 2건 이상이면…' 빈 상태가 먼저 번쩍이고 나서 그래프가 그려진다.
  it("로딩 중이면 빈 상태 문구 대신 로딩 문구를 보여준다", () => {
    render(<PRSparkline history={[]} isLoading />);

    expect(screen.getByText(LOADING_MESSAGE)).toBeDefined();
    expect(screen.queryByText(EMPTY_MESSAGE)).toBeNull();
  });

  it("로딩 중이면 데이터가 있어도 그래프를 아직 그리지 않는다", () => {
    const { container } = render(
      <PRSparkline
        history={[entry(1, "2026-08-01", 100), entry(2, "2026-09-01", 110)]}
        isLoading
      />
    );

    expect(screen.getByText(LOADING_MESSAGE)).toBeDefined();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("로딩이 끝나면 그래프를 그린다", () => {
    const { container } = render(
      <PRSparkline
        history={[entry(1, "2026-08-01", 100), entry(2, "2026-09-01", 110)]}
        isLoading={false}
      />
    );

    expect(screen.queryByText(LOADING_MESSAGE)).toBeNull();
    expect(container.querySelectorAll("circle")).toHaveLength(2);
  });
});

describe("PRSparkline", () => {
  it("기록이 0건이면 그래프 대신 안내 문구를 보여준다", () => {
    const { container } = render(<PRSparkline history={[]} />);

    expect(screen.getByText(EMPTY_MESSAGE)).toBeDefined();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("기록이 1건이면 그래프 대신 안내 문구를 보여준다", () => {
    const { container } = render(
      <PRSparkline history={[entry(1, "2026-08-01", 100)]} />
    );

    expect(screen.getByText(EMPTY_MESSAGE)).toBeDefined();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("기록이 2건이면 점 2개짜리 그래프를 그린다", () => {
    const { container } = render(
      <PRSparkline
        history={[entry(1, "2026-08-01", 100), entry(2, "2026-09-01", 110)]}
      />
    );

    expect(screen.queryByText(EMPTY_MESSAGE)).toBeNull();
    expect(pointCount(container)).toBe(2);
    expect(container.querySelector("polyline")?.getAttribute("points")).toBeTruthy();
  });

  it("같은 날짜 기록 2건에서도 tSpan 0으로 터지지 않는다", () => {
    const { container } = render(
      <PRSparkline
        history={[entry(1, "2026-08-01", 100), entry(2, "2026-08-01", 105)]}
      />
    );

    expect(pointCount(container)).toBe(2);
    container.querySelectorAll("circle").forEach((c) => {
      expect(Number.isFinite(Number(c.getAttribute("cx")))).toBe(true);
      expect(Number.isFinite(Number(c.getAttribute("cy")))).toBe(true);
    });
  });

  it("무게가 모두 같은 3건에서도 wSpan 0으로 터지지 않는다", () => {
    const { container } = render(
      <PRSparkline
        history={[
          entry(1, "2026-07-01", 100),
          entry(2, "2026-08-01", 100),
          entry(3, "2026-09-01", 100),
        ]}
      />
    );

    expect(pointCount(container)).toBe(3);
    container.querySelectorAll("circle").forEach((c) => {
      expect(Number.isFinite(Number(c.getAttribute("cy")))).toBe(true);
    });
  });

  it("날짜가 뒤섞여 들어와도 시간순으로 정렬해 그린다", () => {
    const { container } = render(
      <PRSparkline
        history={[
          entry(1, "2026-09-01", 120),
          entry(2, "2026-07-01", 100),
          entry(3, "2026-08-01", 110),
        ]}
      />
    );

    const xs = Array.from(container.querySelectorAll("circle")).map((c) =>
      Number(c.getAttribute("cx"))
    );
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  it("파싱할 수 없는 날짜는 걸러내고 남은 기록으로 그린다", () => {
    const { container } = render(
      <PRSparkline
        history={[
          entry(1, "not-a-date", 999),
          entry(2, "2026-08-01", 100),
          entry(3, "2026-09-01", 110),
        ]}
      />
    );

    expect(pointCount(container)).toBe(2);
  });

  it("최신 기록의 무게 라벨은 항상 노출된다", () => {
    render(
      <PRSparkline
        history={[entry(1, "2026-08-01", 100), entry(2, "2026-09-01", 137)]}
      />
    );

    expect(screen.getByText("137")).toBeDefined();
  });
});
