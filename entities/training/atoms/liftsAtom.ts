import { atomWithStorage } from "jotai/utils";
import { PersonalRecord, WeightPercentage } from "@/types/training"; // 분리된 타입 가져오기

export const personalRecordAtom = atomWithStorage<PersonalRecord>(
  "personalRecord",
  {},
);
export const barWeightAtom = atomWithStorage<number | undefined>(
  "barWeight",
  undefined,
);
export const programPercentagesAtom = atomWithStorage<WeightPercentage[]>(
  "programPercentages",
  [],
);
export const selectedLiftAtom = atomWithStorage("selectedLift", "");
