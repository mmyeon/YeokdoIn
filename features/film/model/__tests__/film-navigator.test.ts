import type { ExercisePosition } from "@/features/program-runner/model/types";
import {
  initialState,
  canPrev,
  canNext,
  stepPrev,
  stepNext,
} from "../film-navigator";

function makePosition(setCount: number): ExercisePosition {
  return {
    blockIdx: 0,
    exerciseIdx: 0,
    totalBlocks: 1,
    totalExercises: 1,
    blockMovements: [],
    movement: {
      id: "m1",
      name: "Back Squat",
      alias: null,
      sets: [],
    } as unknown as ExercisePosition["movement"],
    sets: Array.from({ length: setCount }, (_, i) => ({
      setNumber: i + 1,
      totalSets: setCount,
      percentage: null,
      reps: { type: "simple", reps: 3 },
      prescribedKg: null,
    })),
  };
}

describe("film-navigator", () => {
  const positions = [makePosition(3), makePosition(2), makePosition(4)];

  describe("initialState", () => {
    it("지정한 positionIdx와 setIdx 0으로 초기 상태를 반환한다", () => {
      expect(initialState(2)).toEqual({ positionIdx: 2, setIdx: 0 });
    });

    it("기본값은 positionIdx 0이다", () => {
      expect(initialState()).toEqual({ positionIdx: 0, setIdx: 0 });
    });
  });

  describe("canPrev", () => {
    it("첫 번째 운동 첫 번째 세트에서 false를 반환한다", () => {
      expect(canPrev({ positionIdx: 0, setIdx: 0 })).toBe(false);
    });

    it("세트 인덱스가 0보다 크면 true를 반환한다", () => {
      expect(canPrev({ positionIdx: 0, setIdx: 1 })).toBe(true);
    });

    it("positionIdx가 0보다 크면 true를 반환한다", () => {
      expect(canPrev({ positionIdx: 1, setIdx: 0 })).toBe(true);
    });
  });

  describe("canNext", () => {
    it("마지막 운동 마지막 세트에서 false를 반환한다", () => {
      expect(canNext({ positionIdx: 2, setIdx: 3 }, positions)).toBe(false);
    });

    it("현재 운동에 다음 세트가 있으면 true를 반환한다", () => {
      expect(canNext({ positionIdx: 0, setIdx: 1 }, positions)).toBe(true);
    });

    it("다음 운동이 있으면 true를 반환한다", () => {
      expect(canNext({ positionIdx: 0, setIdx: 2 }, positions)).toBe(true);
    });

    it("positions가 빈 배열이면 false를 반환한다", () => {
      expect(canNext({ positionIdx: 0, setIdx: 0 }, [])).toBe(false);
    });
  });

  describe("stepPrev", () => {
    it("같은 운동 내 이전 세트로 이동한다", () => {
      expect(stepPrev({ positionIdx: 0, setIdx: 2 }, positions)).toEqual({
        positionIdx: 0,
        setIdx: 1,
      });
    });

    it("세트 0에서 이전 운동의 마지막 세트로 이동한다", () => {
      expect(stepPrev({ positionIdx: 1, setIdx: 0 }, positions)).toEqual({
        positionIdx: 0,
        setIdx: 2,
      });
    });

    it("첫 번째 운동 첫 번째 세트에서 상태가 변경되지 않는다", () => {
      const state = { positionIdx: 0, setIdx: 0 };
      expect(stepPrev(state, positions)).toEqual(state);
    });
  });

  describe("stepNext", () => {
    it("같은 운동 내 다음 세트로 이동한다", () => {
      expect(stepNext({ positionIdx: 0, setIdx: 0 }, positions)).toEqual({
        positionIdx: 0,
        setIdx: 1,
      });
    });

    it("마지막 세트에서 다음 운동의 첫 번째 세트로 이동한다", () => {
      expect(stepNext({ positionIdx: 0, setIdx: 2 }, positions)).toEqual({
        positionIdx: 1,
        setIdx: 0,
      });
    });

    it("마지막 운동 마지막 세트에서 상태가 변경되지 않는다", () => {
      const state = { positionIdx: 2, setIdx: 3 };
      expect(stepNext(state, positions)).toEqual(state);
    });
  });
});
