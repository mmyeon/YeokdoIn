import type { Movement } from "@/features/notation/model/types";
import { resolveRefMovement } from "./resolve-movement";
import { computePrescribedWeight } from "./plates";

export type WeightResolution =
  | {
      kind: "computed";
      kg: number;
      pr: number;
      percentage: number;
      exerciseId: number;
      refName: string;
    }
  | { kind: "no-percentage"; refName: string }
  | { kind: "unresolved-alias"; missingName: string }
  | { kind: "no-pr"; exerciseId: number; refName: string };

export interface ResolveWeightInput {
  /** parsed block movements from features/notation */
  movements: Movement[];
  /** percentage for the specific set-entry being resolved */
  percentage: number | null;
  /** lowercase alias/movement-name → exerciseId */
  aliasMap: Readonly<Record<string, number>>;
  /** exerciseId → current PR in kg */
  prMap: Readonly<Record<number, number>>;
}

/**
 * 파싱된 블록의 movements + 단일 set-entry 퍼센트 + 별칭/PR 매핑으로 처방 중량을 해결한다.
 * UI 계층에서 BlockCard가 어떤 상태(계산됨 / 퍼센트 없음 / 별칭 미연결 / PR 없음)인지 분기할 수 있도록
 * 태그드 유니온으로 반환한다.
 */
export function resolveWeight({
  movements,
  percentage,
  aliasMap,
  prMap,
}: ResolveWeightInput): WeightResolution {
  const ref = resolveRefMovement({ movements });
  const refName = ref.name;
  const aliasKey = refName.trim().toLowerCase();
  const exerciseId = aliasMap[aliasKey];

  if (percentage === null) {
    return { kind: "no-percentage", refName };
  }

  if (exerciseId === undefined) {
    return { kind: "unresolved-alias", missingName: refName };
  }

  const pr = prMap[exerciseId];
  if (pr === undefined) {
    return { kind: "no-pr", exerciseId, refName };
  }

  return {
    kind: "computed",
    kg: computePrescribedWeight(pr, percentage),
    pr,
    percentage,
    exerciseId,
    refName,
  };
}
