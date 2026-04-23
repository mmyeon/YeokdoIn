export interface MovementGroup {
  category: string;
  items: readonly string[];
}

export const MOVEMENT_GROUPS: readonly MovementGroup[] = [
  {
    category: 'Snatch',
    items: [
      'snatch',
      'power snatch',
      'squat snatch',
      'muscle snatch',
      'snatch pull',
      'snatch high pull',
      'snatch deadlift',
      'halting snatch deadlift',
      'snatch balance',
      'heaving snatch balance',
      'drop snatch',
      'hang snatch',
      'hang power snatch',
      'hang squat snatch',
      'block snatch',
      'block power snatch',
      'snatch from blocks',
      'snatch pull from blocks',
      'tall snatch',
      'tall muscle snatch',
      'dip snatch',
      'snatch push press',
      'snatch segment deadlift',
      'snatch lift-off',
    ],
  },
  {
    category: 'Clean',
    items: [
      'clean',
      'power clean',
      'squat clean',
      'muscle clean',
      'clean pull',
      'clean high pull',
      'clean deadlift',
      'halting clean deadlift',
      'hang clean',
      'hang power clean',
      'hang squat clean',
      'block clean',
      'block power clean',
      'clean from blocks',
      'clean pull from blocks',
      'tall clean',
      'tall muscle clean',
      'dip clean',
      'clean segment deadlift',
      'clean lift-off',
    ],
  },
  {
    category: 'Jerk',
    items: [
      'jerk',
      'push jerk',
      'split jerk',
      'power jerk',
      'squat jerk',
      'jerk behind the neck',
      'jerk dip squat',
      'jerk recovery',
      'jerk balance',
      'jerk support',
      'pause jerk',
    ],
  },
  {
    category: '복합 동작',
    items: [
      'clean & jerk',
      'clean & push jerk',
      'clean & split jerk',
      'clean & power jerk',
      'complex (snatch + OHS)',
      'complex (clean + front squat + jerk)',
    ],
  },
  {
    category: 'Squat',
    items: [
      'front squat',
      'back squat',
      'overhead squat',
      'pause front squat',
      'pause back squat',
      'pause overhead squat',
      'snatch grip back squat',
      '1¼ front squat',
      '1¼ back squat',
      'box squat',
    ],
  },
  {
    category: 'Press',
    items: [
      'strict press',
      'push press',
      'press behind the neck',
      'push press behind the neck',
      'snatch grip press',
      'snatch grip push press',
      'snatch grip press behind the neck',
      'Sots press',
      'Sots press behind the neck',
      'clean grip Sots press',
    ],
  },
  {
    category: 'Pull / Deadlift',
    items: [
      'deadlift',
      'RDL',
      'snatch grip RDL',
      'clean grip RDL',
      'stiff-leg deadlift',
      'snatch grip deadlift',
      'clean grip deadlift',
    ],
  },
  {
    category: '보조',
    items: [
      'good morning',
      'snatch grip good morning',
      'back extension',
      'glute-ham raise',
      'weighted sit-up',
      'reverse hyper',
    ],
  },
] as const;

export const MOVEMENTS: readonly string[] = MOVEMENT_GROUPS.flatMap(
  (g) => g.items,
);

export const MOVEMENT_MODIFIERS: readonly string[] = [
  'slow',
  'hold',
  'pause',
  'box1',
  'box2',
  'high hang',
  'low hang',
  'no foot',
] as const;

export function isCanonicalMovement(name: string): boolean {
  return MOVEMENTS.includes(name);
}

export function isCanonicalModifier(name: string): boolean {
  return MOVEMENT_MODIFIERS.includes(name);
}
