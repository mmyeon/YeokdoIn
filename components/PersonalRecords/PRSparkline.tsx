"use client";

import { buildSparklinePlot } from "@/features/personal-records/model/sparkline-plot";
import { PRHistoryEntry } from "@/types/personalRecords";

interface PRSparklineProps {
  history: ReadonlyArray<PRHistoryEntry>;
  /**
   * 이력 조회가 끝나지 않았으면 true. 조회 중에는 `history` 가 빈 배열로 오는데
   * 그대로 그리면 '기록이 2건 이상이면…' 빈 상태가 먼저 번쩍이고 나서 그래프가
   * 그려진다. 다 그려진 뒤에 한 번만 보여준다.
   */
  isLoading?: boolean;
  width?: number;
  height?: number;
}

/** viewBox 단위. 좌표 계산은 이 좌표계에서 하고 화면에는 늘려 그린다. */
const PAD = 8;
const MIN_LABEL_GAP = 42;

function formatMonth(ms: number): string {
  const d = new Date(ms);
  return `${d.getMonth() + 1}월`;
}

/** 그래프·빈 상태·로딩이 같은 높이를 차지해야 전환할 때 레이아웃이 튀지 않는다. */
function SparklineFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[110px] items-center justify-center rounded-md border border-dashed border-yd-line text-[11px] text-yd-text-muted">
      {children}
    </div>
  );
}

function PRSparkline({
  history,
  isLoading = false,
  width = 300,
  height = 70,
}: PRSparklineProps) {
  if (isLoading) {
    return <SparklineFrame>불러오는 중...</SparklineFrame>;
  }

  const input = history
    .map((h) => ({ t: new Date(h.prDate).getTime(), w: h.newWeight }))
    .filter((p) => Number.isFinite(p.t))
    .sort((a, b) => a.t - b.t);

  if (input.length < 2) {
    return <SparklineFrame>기록이 2건 이상이면 그래프가 나타납니다.</SparklineFrame>;
  }

  const { points, polyline } = buildSparklinePlot(input, {
    width,
    height,
    pad: PAD,
    minLabelGap: MIN_LABEL_GAP,
  });

  const tMin = input[0].t;
  const tMax = input[input.length - 1].t;

  return (
    <div className="relative h-[110px] w-full rounded-md border border-dashed border-yd-line p-2">
      {/* 무게 라벨은 HTML로 얹는다. svg가 preserveAspectRatio="none"이라
          그 안의 <text>는 가로로 늘어나 읽기 어려워진다. */}
      <div className="relative mt-4 h-[70px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="70"
          preserveAspectRatio="none"
          className="absolute inset-0"
          style={{ overflow: "visible" }}
          aria-hidden
        >
          <polyline
            points={polyline}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-yd-primary"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="currentColor"
              className="text-yd-primary"
            />
          ))}
        </svg>

        {points.map((p, i) =>
          p.showLabel ? (
            <span
              key={i}
              className="absolute -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-yd-text"
              style={{ left: `${(p.x / width) * 100}%`, top: `${p.y - 16}px` }}
            >
              {p.weight}
              <span className="ml-px text-[8px] font-normal text-yd-text-muted">
                kg
              </span>
            </span>
          ) : null
        )}
      </div>

      <span className="absolute bottom-1.5 left-3 text-[10px] text-yd-text-muted">
        {formatMonth(tMin)}
      </span>
      <span className="absolute bottom-1.5 right-3 text-[10px] text-yd-text-muted">
        {formatMonth(tMax)}
      </span>
    </div>
  );
}

export default PRSparkline;
