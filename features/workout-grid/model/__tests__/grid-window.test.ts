import { buildActivityIndex } from '../activity-index';
import { localDateKey } from '../local-date-key';
import { WEEKS, buildGridWindow } from '../grid-window';
import type { DayCell } from '../types';

/**
 * 창 계산의 기준 시각을 고정한다.
 * 2026-09-17 은 **목요일**이라 첫 열·마지막 열이 모두 잘린다 — 잘린 주(spec 경계)를
 * 실제로 밟는 날짜여야 이 테스트가 의미가 있다. 월요일을 고르면 null 자리가 0개다.
 */
const NOW_MS = Date.parse('2026-09-17T05:00:00Z'); // 서울 14:00
const SEOUL = 'Asia/Seoul';

const TODAY = '2026-09-17'; // 목
const THIS_MONDAY = '2026-09-14';
const WINDOW_START = '2026-03-26'; // 오늘로부터 25주 전 (같은 요일)
const FIRST_MONDAY = '2026-03-23';

const DAY_MS = 86_400_000;

/** 테스트 전용 날짜 산술 — grid-window 의 구현을 쓰지 않는다. */
function shiftKey(dateKey: string, days: number): string {
  return new Date(Date.parse(`${dateKey}T00:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

function emptyGrid() {
  return buildGridWindow(NOW_MS, SEOUL, new Map());
}

function cells(grid: readonly (readonly (DayCell | null)[])[]): DayCell[] {
  return grid.flat().filter((c): c is DayCell => c !== null);
}

function gridFor(instants: readonly string[]) {
  const index = buildActivityIndex(
    instants.map((created_at) => ({ created_at, title: null, lines: null })),
    SEOUL,
  );
  return buildGridWindow(NOW_MS, SEOUL, index);
}

describe('buildGridWindow', () => {
  describe('창의 모양', () => {
    it('열이 항상 26개다', () => {
      expect(WEEKS).toBe(26);
      expect(emptyGrid()).toHaveLength(26);
    });

    it('각 열의 길이가 7이다', () => {
      for (const column of emptyGrid()) {
        expect(column).toHaveLength(7);
      }
    });

    it('마지막 열이 이번 주다 — 최신 주가 오른쪽 끝 (FR-005)', () => {
      const last = emptyGrid()[25];
      expect(last.some((c) => c?.dateKey === TODAY)).toBe(true);
      expect(last[0]?.dateKey).toBe(THIS_MONDAY);
    });

    it('각 열의 첫 행이 월요일이고 마지막 행이 일요일이다 (research R3)', () => {
      for (const column of emptyGrid()) {
        for (const [row, cell] of column.entries()) {
          if (!cell) continue;
          const weekday = new Date(`${cell.dateKey}T00:00:00Z`).getUTCDay();
          // getUTCDay: 0=일 … 1=월. 월요일 시작으로 옮기면 행 번호와 같아야 한다.
          expect((weekday + 6) % 7).toBe(row);
        }
      }
    });

    it('첫 열의 창 시작 이전 자리는 셀이 없다 (spec 경계: 잘린 주)', () => {
      const first = emptyGrid()[0];
      expect(first[0]).toBeNull(); // 3/23 월
      expect(first[1]).toBeNull(); // 3/24 화
      expect(first[2]).toBeNull(); // 3/25 수
      expect(first[3]?.dateKey).toBe(WINDOW_START); // 3/26 목 = 창의 시작
      expect(first[6]?.dateKey).toBe(shiftKey(FIRST_MONDAY, 6));
    });

    it('창 시작부터 오늘까지가 176일이다 — 25주 + 오늘', () => {
      const upToToday = cells(emptyGrid()).filter((c) => c.state !== 'future');
      expect(upToToday).toHaveLength(176);
      // 마지막 열의 남은 요일 3개(금·토·일)가 future 로 더 붙는다.
      expect(cells(emptyGrid())).toHaveLength(179);
    });
  });

  describe('상태 판정', () => {
    it('이번 주 남은 요일은 future 이고 inactive 가 아니다 (spec 경계)', () => {
      const last = emptyGrid()[25];
      expect(last[3]?.dateKey).toBe(TODAY);
      for (const row of [4, 5, 6]) {
        expect(last[row]?.state).toBe('future');
      }
    });

    it('오늘은 미래가 아니다 — 기록이 없으면 inactive 다', () => {
      const last = emptyGrid()[25];
      expect(last[3]?.state).toBe('inactive');
    });

    it('인덱스에 있는 날은 active 가 된다', () => {
      const grid = gridFor(['2026-09-15T01:00:00Z']);
      const active = cells(grid).filter((c) => c.state === 'active');

      expect(active.map((c) => c.dateKey)).toEqual(['2026-09-15']);
    });

    it('26주보다 오래된 기록은 어떤 칸도 켜지 않는다', () => {
      // 창 시작 하루 전 — 첫 열 안이지만 창 밖이라 셀 자체가 없다
      const justOutside = gridFor([`${shiftKey(WINDOW_START, -1)}T01:00:00Z`]);
      expect(cells(justOutside).some((c) => c.state === 'active')).toBe(false);

      const longAgo = gridFor(['2024-01-02T01:00:00Z']);
      expect(cells(longAgo).some((c) => c.state === 'active')).toBe(false);
    });

    it('창의 첫날 기록은 켜진다 — 경계를 한 칸 잘라먹지 않는다', () => {
      const grid = gridFor([`${WINDOW_START}T01:00:00Z`]);
      const active = cells(grid).filter((c) => c.state === 'active');

      expect(active.map((c) => c.dateKey)).toEqual([WINDOW_START]);
    });

    it('오늘 기록은 오늘 칸을 켠다', () => {
      const grid = gridFor(['2026-09-17T04:00:00Z']);
      const today = cells(grid).find((c) => c.isToday);

      expect(today?.dateKey).toBe(TODAY);
      expect(today?.state).toBe('active');
    });
  });

  describe('isToday', () => {
    it('정확히 한 칸에만 참이다', () => {
      const flagged = cells(emptyGrid()).filter((c) => c.isToday);

      expect(flagged).toHaveLength(1);
      expect(flagged[0].dateKey).toBe(TODAY);
    });

    it('타임존이 다르면 다른 칸이 오늘이 된다', () => {
      // NOW_MS 는 서울 9/17 14:00 = UTC 9/17 05:00 — 같은 날이므로
      // 경계를 실제로 밟는 시각으로 따로 확인한다.
      const midnightish = Date.parse('2026-09-16T15:30:00Z');
      const seoul = buildGridWindow(midnightish, SEOUL, new Map());
      const utc = buildGridWindow(midnightish, 'UTC', new Map());

      expect(cells(seoul).find((c) => c.isToday)?.dateKey).toBe('2026-09-17');
      expect(cells(utc).find((c) => c.isToday)?.dateKey).toBe('2026-09-16');
    });
  });

  /**
   * spec 검증 1 / quickstart 게이트 2.
   * 기대값을 buildGridWindow 로 만들면 아무것도 검증하지 않으므로,
   * 켜져야 할 날짜 집합을 이 파일 안에서 독립적으로 계산한다.
   */
  describe('임의 100건 대조', () => {
    /** mulberry32 — 시드 고정 난수. 실패를 재현할 수 있어야 한다. */
    function mulberry32(seed: number): () => number {
      let a = seed;
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    it('켜진 칸의 날짜 집합이 독립 계산과 일치한다', () => {
      const random = mulberry32(20260917);

      // 로컬 자정 직전·직후를 표본에 반드시 포함한다.
      const instants: string[] = [
        '2026-09-16T14:59:59Z', // 서울 9/16 23:59:59
        '2026-09-16T15:00:00Z', // 서울 9/17 00:00:00
        `${WINDOW_START}T15:00:00Z`, // 창 시작일의 로컬 자정 직후
        `${shiftKey(WINDOW_START, -1)}T14:59:59Z`, // 창 시작 전날 로컬 자정 직전
      ];

      // 창의 한참 앞뒤까지 퍼뜨린다 — 창 밖 기록이 섞여야 대조가 의미 있다.
      const spread = 300 * DAY_MS;
      while (instants.length < 100) {
        instants.push(
          new Date(NOW_MS - Math.floor(random() * spread)).toISOString(),
        );
      }

      // 독립 계산: 각 시각을 로컬 날짜로 접고, 창 [WINDOW_START, TODAY] 에
      // 드는 것만 남긴다. buildGridWindow 를 쓰지 않는다.
      const expected = new Set(
        instants
          .map((iso) => localDateKey(iso, SEOUL))
          .filter((key) => key >= WINDOW_START && key <= TODAY),
      );

      const actual = new Set(
        cells(gridFor(instants))
          .filter((c) => c.state === 'active')
          .map((c) => c.dateKey),
      );

      expect([...actual].sort()).toEqual([...expected].sort());
      expect(expected.size).toBeGreaterThan(20); // 표본이 창 안에 실제로 들어갔는지
    });
  });
});
