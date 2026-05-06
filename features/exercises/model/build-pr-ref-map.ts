interface ExerciseRef {
  id: number;
  pr_reference_id: number | null;
}

export function buildPrRefMap(
  exercises: ReadonlyArray<ExerciseRef>,
): Record<number, number> {
  const map: Record<number, number> = {};
  for (const row of exercises) {
    if (row.pr_reference_id !== null) {
      map[row.id] = row.pr_reference_id;
    }
  }
  return map;
}
