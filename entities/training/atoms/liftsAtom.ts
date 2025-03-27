import { atomWithStorage } from "jotai/utils";
import { PersonalRecord, WeightPercentage } from "@/types/training"; // 분리된 타입 가져오기

export const personalRecordAtom = atomWithStorage<PersonalRecord>(
  "personalRecord",
  {},
);
export const barWeightAtom = atomWithStorage("barWeight", 0);
export const programPercentagesAtom = atomWithStorage<WeightPercentage[]>(
  "programPercentages",
  [],
);
export const selectedLiftAtom = atomWithStorage("selectedLift", "");
