export interface Program {
  blocks: Block[];
}

export interface Block {
  movements: Movement[];
  percentage: number | null;
  reps: RepScheme;
  sets: number;
}

export type ModifierPosition = 'before' | 'after';

export interface MovementModifier {
  name: string;
  position: ModifierPosition;
}

export interface Movement {
  name: string;
  modifiers: MovementModifier[];
}

export type RepScheme =
  | { type: 'simple'; reps: number }
  | { type: 'complex'; reps: number[] };
