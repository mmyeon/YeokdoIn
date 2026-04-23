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
        },
      ],
    };
    expect(serializeProgram(program)).toBe(
      'snatch pull & power snatch 60% (3+1)x3',
    );
  });

  it('앞 modifier 는 동작 이름 앞에 붙는다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [
            {
              name: 'snatch',
              modifiers: [{ name: 'pause', position: 'before' }],
            },
          ],
          percentage: null,
          reps: { type: 'simple', reps: 5 },
          sets: 3,
        },
      ],
    };
    expect(serializeProgram(program)).toBe('pause snatch 5x3');
  });

  it('뒤 modifier 는 동작 이름 뒤에 붙는다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [
            {
              name: 'back squat',
              modifiers: [{ name: 'pause', position: 'after' }],
            },
          ],
          percentage: null,
          reps: { type: 'simple', reps: 5 },
          sets: 3,
        },
      ],
    };
    expect(serializeProgram(program)).toBe('back squat pause 5x3');
  });

  it('앞/뒤 modifier 가 모두 있을 때 각 위치에 순서대로 붙는다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [
            {
              name: 'snatch',
              modifiers: [
                { name: 'no foot', position: 'before' },
                { name: 'pause', position: 'before' },
                { name: 'hold', position: 'after' },
              ],
            },
          ],
          percentage: 70,
          reps: { type: 'simple', reps: 3 },
          sets: 3,
        },
      ],
    };
    expect(serializeProgram(program)).toBe(
      'no foot pause snatch hold 70% 3x3',
    );
  });

  it('복합 블록에서 각 movement 의 modifier 가 해당 movement 에만 적용된다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [
            {
              name: 'snatch pull',
              modifiers: [{ name: 'pause', position: 'after' }],
            },
            {
              name: 'power snatch',
              modifiers: [{ name: 'no foot', position: 'before' }],
            },
          ],
          percentage: 60,
          reps: { type: 'complex', reps: [3, 1] },
          sets: 3,
        },
      ],
    };
    expect(serializeProgram(program)).toBe(
      'snatch pull pause & no foot power snatch 60% (3+1)x3',
    );
  });

  it('여러 블록을 줄바꿈으로 결합한다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [{ name: 'snatch', modifiers: [] }],
          percentage: 70,
          reps: { type: 'simple', reps: 3 },
          sets: 4,
        },
        {
          movements: [{ name: 'front squat', modifiers: [] }],
          percentage: 80,
          reps: { type: 'simple', reps: 3 },
          sets: 3,
        },
      ],
    };
    expect(serializeProgram(program)).toBe(
      'snatch 70% 3x4\nfront squat 80% 3x3',
    );
  });
});
