export type ExerciseCategory = 'snatch' | 'clean_and_jerk' | 'accessory'
export type LiftType = 'snatch' | 'clean_and_jerk'
export type WeightStatus = 'exceeded' | 'as_planned' | 'reduced'
export type PRBasis = 'current' | 'goal'
export type CoachStyle = 'direct' | 'technical' | 'encouraging'

export interface ExerciseType {
  id: string
  name: string
  category: ExerciseCategory
  displayName: string
}

export interface ExerciseItem {
  id: string
  blockId: string
  orderIndex: number
  exerciseType: string
  reps: number
}

export interface ExerciseBlock {
  id: string
  programId: string
  orderIndex: number
  percentage: number
  sets: number
  items: ExerciseItem[]
}

export interface Program {
  id: string
  userId: string
  name: string
  blocks: ExerciseBlock[]
  createdAt: string
  updatedAt: string
}

export interface PRRecord {
  id: string
  userId: string
  liftType: LiftType
  weight: number
  isGoal: boolean
  recordedAt: string
  createdAt: string
}

export interface SessionBlockItem {
  id: string
  sessionBlockId: string
  orderIndex: number
  exerciseType: string
  reps: number
}

export interface SessionBlock {
  id: string
  sessionId: string
  orderIndex: number
  percentage: number
  sets: number
  plannedWeight: number
  actualWeight: number
  weightStatus: WeightStatus
  items: SessionBlockItem[]
}

export interface TrainingSession {
  id: string
  userId: string
  sessionDate: string
  programId: string | null
  blocks: SessionBlock[]
  notes: string[]
  prBasis: PRBasis
  createdAt: string
}

export interface CoachProfile {
  id: string
  userId: string
  name: string
  style: CoachStyle
  createdAt: string
}

// 훈련 실행 중 클라이언트 상태 (저장 전)
export interface ActiveSessionBlock {
  tempId: string
  orderIndex: number
  percentage: number
  sets: number
  completedSets: number
  plannedWeight: number
  actualWeight: number
  weightStatus: WeightStatus
  items: Array<{ exerciseType: string; reps: number; orderIndex: number }>
}
