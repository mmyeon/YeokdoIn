export interface Program {
  blocks: Block[];
}

export interface Block {
  movements: Movement[];
  setEntries: SetEntry[];
}

export interface SetEntry {
  percentage: number | null;
  reps: RepScheme;
  sets: number;
}

export interface Movement {
  exerciseId: number;
  /** 저장 시점에 서버가 exercises.name 에서 찍은 표시용 이름. 계산에는 exerciseId 만 쓴다. */
  name: string;
}

export type RepScheme =
  | { type: 'simple'; reps: number }
  | { type: 'complex'; reps: number[] };
