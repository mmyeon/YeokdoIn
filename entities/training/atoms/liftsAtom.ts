import { WeightPercentage } from "@/app/training/program-input/page";
import { atomWithStorage } from "jotai/utils";

type PersonalRecord = {
  clean?: number;
  snatch?: number;
};

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
