import { calculatePlates } from "@/features/programs/model/plates";

/**
 * "20 bar + 2×15 + 1×2.5 per side" 형태의 플레이트 분해 요약.
 * 한쪽 기준 플레이트를 같은 무게끼리 묶어 `count×weight` 로 표기한다.
 */
export function formatPlateSummary(totalKg: number, barWeight: number): string {
  if (totalKg < barWeight) return "";
  const remaining = totalKg - barWeight;
  const plates = calculatePlates(remaining);

  if (plates.length === 0) {
    return `${barWeight} bar`;
  }

  const grouped: Array<{ kg: number; count: number }> = [];
  for (const p of plates) {
    const last = grouped[grouped.length - 1];
    if (last && last.kg === p) last.count += 1;
    else grouped.push({ kg: p, count: 1 });
  }

  const perSide = grouped
    .map((g) => (g.count === 1 ? `${g.kg}` : `${g.count}×${g.kg}`))
    .join(" + ");

  return `${barWeight} bar + ${perSide} (한쪽)`;
}
