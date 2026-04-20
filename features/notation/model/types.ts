export interface Program {
  blocks: Block[];
}

export interface Block {
  movements: Movement[];
  percentage: number | null;
  reps: RepScheme;
  sets: number;
  modifiers: string[];
}

export interface Movement {
  name: string;
  modifiers: string[];
}

export type RepScheme =
  | { type: 'simple'; reps: number }
  | { type: 'complex'; reps: number[] };
