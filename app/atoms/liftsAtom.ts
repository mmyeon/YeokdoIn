import { atomWithStorage } from "jotai/utils";
import { WeightPercentage } from "../training/program-input/page";

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
