import { z } from 'zod'

export const prRecordSchema = z.object({
  liftType: z.enum(['snatch', 'clean_and_jerk'], {
    errorMap: () => ({ message: '운동 종목을 선택하세요' }),
  }),
  weight: z.number({ invalid_type_error: '숫자를 입력하세요' })
    .positive('무게는 0보다 커야 합니다')
    .max(500, '무게는 500kg 이하여야 합니다'),
  isGoal: z.boolean(),
  recordedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다'),
})

export const exerciseItemSchema = z.object({
  exerciseType: z.string().min(1, '운동 종목을 선택하세요'),
  reps: z.number({ invalid_type_error: '숫자를 입력하세요' })
    .int('횟수는 정수여야 합니다')
    .positive('횟수는 1 이상이어야 합니다')
    .max(20, '횟수는 20 이하여야 합니다'),
  orderIndex: z.number().int().min(0),
})

export const exerciseBlockSchema = z.object({
  percentage: z.number({ invalid_type_error: '숫자를 입력하세요' })
    .int('강도는 정수여야 합니다')
    .min(1, '강도는 1% 이상이어야 합니다')
    .max(100, '강도는 100% 이하여야 합니다'),
  sets: z.number({ invalid_type_error: '숫자를 입력하세요' })
    .int('세트는 정수여야 합니다')
    .positive('세트는 1 이상이어야 합니다')
    .max(20, '세트는 20 이하여야 합니다'),
  orderIndex: z.number().int().min(0),
  items: z.array(exerciseItemSchema).min(1, '운동 항목을 1개 이상 추가하세요'),
})

export const programSchema = z.object({
  name: z.string()
    .min(1, '프로그램 이름을 입력하세요')
    .max(100, '프로그램 이름은 100자 이하여야 합니다'),
  blocks: z.array(exerciseBlockSchema).min(1, '운동 블록을 1개 이상 추가하세요'),
})

export const trainingSessionSchema = z.object({
  programId: z.string().uuid().nullable(),
  blocks: z.array(exerciseBlockSchema.omit({ orderIndex: true })).min(1),
  notes: z.array(z.string().max(500, '메모는 500자 이하여야 합니다')),
  prBasis: z.enum(['current', 'goal']),
})

export type PRRecordInput = z.infer<typeof prRecordSchema>
export type ExerciseBlockInput = z.infer<typeof exerciseBlockSchema>
export type ProgramInput = z.infer<typeof programSchema>
