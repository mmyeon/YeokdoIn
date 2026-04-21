import type { Plates } from "@/types/training";

const AVAILABLE_PLATES: Plates = [25, 20, 15, 10, 5, 2.5, 2, 1.5, 1, 0.5];

/**
 * 바벨을 제외한 남은 무게를 한쪽에 필요한 플레이트로 분해한다.
 * 양쪽 대칭으로 적용되므로 한쪽 기준 무거운 플레이트부터 반환한다.
 */
export function calculatePlates(remainingWeight: number): Plates {
  if (remainingWeight <= 0) return [];

  let oneSideWeight = remainingWeight / 2;
  const plates: Plates = [];

  for (const plate of AVAILABLE_PLATES) {
    while (oneSideWeight >= plate) {
      plates.push(plate);
      oneSideWeight -= plate;
    }
  }

  return plates;
}

/**
 * PR과 퍼센트로부터 처방 중량(kg)을 계산한다.
 * 1kg 단위로 반올림한다 (양쪽 대칭 최소 단위 0.5kg × 2 = 1kg).
 */
export function computePrescribedWeight(pr: number, percentage: number): number {
  const raw = (pr * percentage) / 100;
  return Math.round(raw);
}
