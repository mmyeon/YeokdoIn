import type { ExercisePosition } from "@/features/program-runner/model/types";

export interface FilmNavigatorState {
  positionIdx: number;
  setIdx: number;
}

export function initialState(initialPositionIdx = 0): FilmNavigatorState {
  return { positionIdx: initialPositionIdx, setIdx: 0 };
}

export function canPrev(state: FilmNavigatorState): boolean {
  return state.positionIdx > 0 || state.setIdx > 0;
}

export function canNext(
  state: FilmNavigatorState,
  positions: ExercisePosition[]
): boolean {
  const pos = positions[state.positionIdx];
  if (!pos) return false;
  const isLastSet = state.setIdx >= pos.sets.length - 1;
  const isLastPosition = state.positionIdx >= positions.length - 1;
  return !isLastSet || !isLastPosition;
}

export function stepPrev(
  state: FilmNavigatorState,
  positions: ExercisePosition[]
): FilmNavigatorState {
  if (state.setIdx > 0) {
    return { ...state, setIdx: state.setIdx - 1 };
  }
  if (state.positionIdx > 0) {
    const prevPosIdx = state.positionIdx - 1;
    const prevPos = positions[prevPosIdx];
    return {
      positionIdx: prevPosIdx,
      setIdx: Math.max(0, (prevPos?.sets.length ?? 1) - 1),
    };
  }
  return state;
}

export function stepNext(
  state: FilmNavigatorState,
  positions: ExercisePosition[]
): FilmNavigatorState {
  const pos = positions[state.positionIdx];
  if (!pos) return state;
  if (state.setIdx < pos.sets.length - 1) {
    return { ...state, setIdx: state.setIdx + 1 };
  }
  if (state.positionIdx < positions.length - 1) {
    return { positionIdx: state.positionIdx + 1, setIdx: 0 };
  }
  return state;
}
