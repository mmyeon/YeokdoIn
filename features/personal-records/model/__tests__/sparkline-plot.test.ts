import { buildSparklinePlot } from "../sparkline-plot";

const OPTIONS = { width: 300, height: 70, pad: 8, minLabelGap: 30 };

describe("buildSparklinePlot", () => {
  it("첫 점은 왼쪽 패딩에, 마지막 점은 오른쪽 패딩에 놓는다", () => {
    const plot = buildSparklinePlot(
      [
        { t: 0, w: 50 },
        { t: 100, w: 60 },
      ],
      OPTIONS
    );

    expect(plot.points[0].x).toBeCloseTo(8);
    expect(plot.points[1].x).toBeCloseTo(292);
  });

  it("무게가 클수록 y가 작다 (SVG는 아래가 y 증가)", () => {
    const plot = buildSparklinePlot(
      [
        { t: 0, w: 50 },
        { t: 100, w: 60 },
      ],
      OPTIONS
    );

    expect(plot.points[1].y).toBeLessThan(plot.points[0].y);
  });

  it("무게가 모두 같으면 나눗셈이 깨지지 않고 같은 높이에 놓인다", () => {
    const plot = buildSparklinePlot(
      [
        { t: 0, w: 50 },
        { t: 100, w: 50 },
        { t: 200, w: 50 },
      ],
      OPTIONS
    );

    expect(plot.points.every((p) => Number.isFinite(p.y))).toBe(true);
    expect(new Set(plot.points.map((p) => p.y)).size).toBe(1);
  });

  it("날짜가 모두 같아도 나눗셈이 깨지지 않는다", () => {
    const plot = buildSparklinePlot(
      [
        { t: 100, w: 50 },
        { t: 100, w: 60 },
      ],
      OPTIONS
    );

    expect(plot.points.every((p) => Number.isFinite(p.x))).toBe(true);
  });

  it("polyline 문자열을 좌표 순서대로 만든다", () => {
    const plot = buildSparklinePlot(
      [
        { t: 0, w: 50 },
        { t: 100, w: 60 },
      ],
      OPTIONS
    );

    expect(plot.polyline).toBe(
      plot.points.map((p) => `${p.x},${p.y}`).join(" ")
    );
  });

  it("점이 성길 때는 모든 점에 무게 라벨을 붙인다", () => {
    const plot = buildSparklinePlot(
      [
        { t: 0, w: 50 },
        { t: 100, w: 60 },
        { t: 200, w: 70 },
      ],
      OPTIONS
    );

    expect(plot.points.map((p) => p.showLabel)).toEqual([true, true, true]);
  });

  it("점이 촘촘하면 라벨을 솎아내되 최신 기록 라벨은 반드시 남긴다", () => {
    const dense = Array.from({ length: 20 }, (_, i) => ({ t: i, w: 50 + i }));

    const plot = buildSparklinePlot(dense, OPTIONS);
    const labeled = plot.points.filter((p) => p.showLabel);

    expect(labeled.length).toBeLessThan(dense.length);
    expect(plot.points[plot.points.length - 1].showLabel).toBe(true);
    // 남은 라벨끼리는 최소 간격을 지킨다
    for (let i = 1; i < labeled.length; i++) {
      expect(labeled[i].x - labeled[i - 1].x).toBeGreaterThanOrEqual(
        OPTIONS.minLabelGap
      );
    }
  });

  it("각 점은 원래 무게를 라벨 값으로 들고 있다", () => {
    const plot = buildSparklinePlot(
      [
        { t: 0, w: 50 },
        { t: 100, w: 62 },
      ],
      OPTIONS
    );

    expect(plot.points.map((p) => p.weight)).toEqual([50, 62]);
  });
});
