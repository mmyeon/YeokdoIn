import {
  MOVEMENTS,
  MOVEMENT_GROUPS,
  MOVEMENT_MODIFIERS,
  isCanonicalModifier,
  isCanonicalMovement,
} from '../movements';

describe('movements 카탈로그', () => {
  it('MOVEMENTS 가 MOVEMENT_GROUPS 의 평탄화 결과와 일치한다', () => {
    const flat = MOVEMENT_GROUPS.flatMap((g) => g.items);
    expect(MOVEMENTS).toEqual(flat);
  });

  it('동작 이름에 중복이 없다', () => {
    const set = new Set(MOVEMENTS);
    expect(set.size).toBe(MOVEMENTS.length);
  });

  it('canonical 판정 헬퍼가 정확하다', () => {
    expect(isCanonicalMovement('snatch')).toBe(true);
    expect(isCanonicalMovement('snath')).toBe(false);
    expect(isCanonicalModifier('slow')).toBe(true);
    expect(isCanonicalModifier('unknown')).toBe(false);
  });

  it('MOVEMENT_MODIFIERS 가 비어 있지 않다', () => {
    expect(MOVEMENT_MODIFIERS.length).toBeGreaterThan(0);
  });
});
