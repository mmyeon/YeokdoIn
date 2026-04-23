import { serializeProgram } from '../serialize';
import type { Program } from '@/features/notation/model/types';

describe('serializeProgram', () => {
  it('단일 블록 simple reps 를 직렬화한다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [{ name: 'back squat', modifiers: [] }],
          percentage: 70,
          reps: { type: 'simple', reps: 5 },
          sets: 3,
          modifiers: [],
        },
      ],
    };
    expect(serializeProgram(program)).toBe('back squat 70% 5x3');
  });

  it('complex reps 는 괄호로 감싸 직렬화한다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [
            { name: 'snatch pull', modifiers: [] },
            { name: 'power snatch', modifiers: [] },
          ],
          percentage: 60,
          reps: { type: 'complex', reps: [3, 1] },
          sets: 3,
          modifiers: [],
        },
      ],
    };
    expect(serializeProgram(program)).toBe(
      'snatch pull & power snatch 60% (3+1)x3',
    );
  });

  it('modifiers 와 null 퍼센트를 포함한다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [{ name: 'back squat', modifiers: [] }],
          percentage: null,
          reps: { type: 'simple', reps: 5 },
          sets: 3,
          modifiers: ['slow', 'pause'],
        },
      ],
    };
    expect(serializeProgram(program)).toBe('back squat (slow, pause) 5x3');
  });

  it('여러 블록을 줄바꿈으로 결합한다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [{ name: 'snatch', modifiers: [] }],
          percentage: 70,
          reps: { type: 'simple', reps: 3 },
          sets: 4,
          modifiers: [],
        },
        {
          movements: [{ name: 'front squat', modifiers: [] }],
          percentage: 80,
          reps: { type: 'simple', reps: 3 },
          sets: 3,
          modifiers: [],
        },
      ],
    };
    expect(serializeProgram(program)).toBe(
      'snatch 70% 3x4\nfront squat 80% 3x3',
    );
  });
});
