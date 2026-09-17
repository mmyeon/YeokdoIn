import { buildGridWindow } from '../grid-window';
import { buildMonthLabels } from '../axis-labels';

/**
 * 열마다 라벨을 달면 375px 에서 글자가 겹친다. **월이 바뀌는 열에만** 단다.
 * 이 함수가 하는 일은 "어느 열에 무슨 글자" 하나뿐이고, 렌더는 UI 가 한다.
 */

const NOW_MS = Date.parse('2026-09-17T05:00:00Z');
const SEOUL = 'Asia/Seoul';

const labels = () =>
  buildMonthLabels(buildGridWindow(NOW_MS, SEOUL, new Map()));

describe('buildMonthLabels', () => {
  it('첫 열에 라벨을 단다 — 기준점이 없으면 뒤의 라벨을 읽을 수 없다', () => {
    expect(labels()[0]).toEqual({ weekIndex: 0, label: '3월' });
  });

  it('월이 바뀌는 열에만 라벨이 붙는다', () => {
    const weeks = buildGridWindow(NOW_MS, SEOUL, new Map());
    const result = labels();

    for (const { weekIndex, label } of result) {
      const first = weeks[weekIndex].find((c) => c !== null);
      expect(label).toBe(`${Number(first!.dateKey.slice(5, 7))}월`);
    }
  });

  it('같은 월이 이어지는 열에는 라벨이 없다', () => {
    const indexes = labels().map((l) => l.weekIndex);
    // 26열에 6~7개월이 걸치므로 라벨은 열 수보다 훨씬 적어야 한다.
    expect(indexes.length).toBeLessThan(10);
    expect(new Set(indexes).size).toBe(indexes.length);
  });

  it('weekIndex 는 오름차순이다', () => {
    const indexes = labels().map((l) => l.weekIndex);
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);
  });

  it('창이 걸친 달이 3월부터 9월까지 빠짐없이 나온다', () => {
    expect(labels().map((l) => l.label)).toEqual([
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
    ]);
  });

  it('빈 배열은 빈 결과가 된다', () => {
    expect(buildMonthLabels([])).toEqual([]);
  });
});
