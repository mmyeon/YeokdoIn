/**
 * PR 추이 스파크라인의 좌표 계산 — 순수 함수.
 *
 * 그래프에 무게 숫자가 없으면 "올라갔다"만 알고 "몇 kg인지"는 모른다. 그래서
 * 점마다 무게 라벨을 붙이되, 기록이 촘촘해지면 라벨이 서로 겹치므로 최소 간격을
 * 두고 솎아낸다. 솎을 때 **최신 기록(현재 PR)은 항상 남긴다** — 가장 알고 싶은 값이다.
 *
 * I/O·React 의존 없음.
 */

export type SparklineInput = {
  /** epoch ms */
  t: number;
  /** kg */
  w: number;
};

export type SparklinePoint = {
  x: number;
  y: number;
  weight: number;
  showLabel: boolean;
};

export type SparklinePlot = {
  points: SparklinePoint[];
  polyline: string;
};

export type SparklinePlotOptions = {
  width: number;
  height: number;
  /** 가장자리 여백 (viewBox 단위) */
  pad: number;
  /** 라벨끼리 유지할 최소 x 간격 (viewBox 단위) */
  minLabelGap: number;
};

export function buildSparklinePlot(
  input: readonly SparklineInput[],
  { width, height, pad, minLabelGap }: SparklinePlotOptions
): SparklinePlot {
  const tMin = Math.min(...input.map((p) => p.t));
  const tMax = Math.max(...input.map((p) => p.t));
  const wMin = Math.min(...input.map((p) => p.w));
  const wMax = Math.max(...input.map((p) => p.w));

  // 모든 값이 같을 때 0으로 나누지 않기 위한 하한. 이 경우 모든 점이 같은
  // 위치에 놓이는 것이 의도된 동작이다.
  const tSpan = Math.max(1, tMax - tMin);
  const wSpan = Math.max(1, wMax - wMin);

  const positioned = input.map((p) => ({
    x: pad + ((p.t - tMin) / tSpan) * (width - pad * 2),
    // SVG는 아래로 갈수록 y가 커지므로 무게가 클수록 y가 작아진다.
    y: height - pad - ((p.w - wMin) / wSpan) * (height - pad * 2),
    weight: p.w,
  }));

  const labeled = selectLabelIndexes(
    positioned.map((p) => p.x),
    minLabelGap
  );

  const points = positioned.map((p, i) => ({
    ...p,
    showLabel: labeled.has(i),
  }));

  return {
    points,
    polyline: points.map((p) => `${p.x},${p.y}`).join(" "),
  };
}

/**
 * 오른쪽(최신)에서 왼쪽으로 훑으며 최소 간격을 만족하는 점만 남긴다.
 * 최신 기록이 기준점이 되므로 어떤 밀도에서도 현재 PR 라벨은 살아남는다.
 */
function selectLabelIndexes(xs: readonly number[], minGap: number): Set<number> {
  const kept = new Set<number>();
  let lastX: number | null = null;

  for (let i = xs.length - 1; i >= 0; i--) {
    if (lastX === null || lastX - xs[i] >= minGap) {
      kept.add(i);
      lastX = xs[i];
    }
  }

  return kept;
}
