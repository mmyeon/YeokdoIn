interface Searchable {
  id: number;
  name: string;
  is_pr_tracked: boolean;
}

function rank(name: string, query: string): number {
  const lower = name.toLowerCase();
  if (lower === query) return 0;
  if (lower.startsWith(query)) return 1;
  return 2;
}

export function searchExercises<T extends Searchable>(
  exercises: readonly T[],
  query: string,
  limit: number,
): T[] {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');

  if (normalized === '') {
    return exercises
      .filter((e) => e.is_pr_tracked)
      .concat(exercises.filter((e) => !e.is_pr_tracked))
      .slice(0, limit);
  }

  const tokens = normalized.split(' ');
  return exercises
    .filter((e) => {
      const lower = e.name.toLowerCase();
      return tokens.every((t) => lower.includes(t));
    })
    .sort(
      (a, b) =>
        rank(a.name, normalized) - rank(b.name, normalized) ||
        a.name.length - b.name.length ||
        a.id - b.id,
    )
    .slice(0, limit);
}
