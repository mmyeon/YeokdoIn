import { serializeProgram } from '../serialize';
import type { Program } from '@/features/notation/model/types';

describe('serializeProgram', () => {
  it('단일 블록 simple reps 를 직렬화한다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [{ exerciseId: 11, name: 'back squat' }],
          setEntries: [
            { percentage: 70, reps: { type: 'simple', reps: 5 }, sets: 3 },
          ],
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
            { exerciseId: 65, name: 'snatch pull' },
            { exerciseId: 2, name: 'power snatch' },
          ],
          setEntries: [
            { percentage: 60, reps: { type: 'complex', reps: [3, 1] }, sets: 3 },
          ],
        },
      ],
    };
    expect(serializeProgram(program)).toBe(
      'snatch pull & power snatch 60% (3+1)x3',
    );
  });

  it('여러 블록을 줄바꿈으로 결합한다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [{ exerciseId: 27, name: 'snatch' }],
          setEntries: [
            { percentage: 70, reps: { type: 'simple', reps: 3 }, sets: 4 },
          ],
        },
        {
          movements: [{ exerciseId: 33, name: 'front squat' }],
          setEntries: [
            { percentage: 80, reps: { type: 'simple', reps: 3 }, sets: 3 },
          ],
        },
      ],
    };
    expect(serializeProgram(program)).toBe(
      'snatch 70% 3x4\nfront squat 80% 3x3',
    );
  });

  it('하나의 블록에 여러 set-entry 가 있으면 쉼표로 묶는다', () => {
    const program: Program = {
      blocks: [
        {
          movements: [{ exerciseId: 11, name: 'back squat' }],
          setEntries: [
            { percentage: 50, reps: { type: 'simple', reps: 3 }, sets: 3 },
            { percentage: 60, reps: { type: 'simple', reps: 3 }, sets: 3 },
          ],
        },
      ],
    };
    expect(serializeProgram(program)).toBe(
      'back squat 50% 3x3, 60% 3x3',
    );
  });
});
