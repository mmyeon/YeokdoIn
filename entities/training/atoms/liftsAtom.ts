import { atomWithStorage } from "jotai/utils";
import {
  LiftOptions,
  PersonalRecord,
  WeightPercentage,
} from "@/types/training";

export const personalRecordAtom = atomWithStorage<PersonalRecord>(
  "personalRecord",
  {
    cleanAndJerk: "",
    snatch: "",
  },
);
export const barWeightAtom = atomWithStorage<number | undefined>(
  "barWeight",
  undefined,
);
export const programPercentagesAtom = atomWithStorage<WeightPercentage[]>(
  "programPercentages",
  [],
);
export const selectedLiftAtom = atomWithStorage<LiftOptions>(
  "selectedLift",
  "cleanAndJerk",
);
