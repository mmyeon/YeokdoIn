import { atomWithStorage } from "jotai/utils";
import {
  LiftOptions,
  PersonalRecord,
  WeightPercentage,
} from "@/types/training";
import { atom } from "jotai";

export const personalRecordAtom = atomWithStorage<PersonalRecord>(
  "personalRecord",
  {
    cleanAndJerk: "",
    snatch: "",
  },
);

export const programPercentagesAtom = atomWithStorage<WeightPercentage[]>(
  "programPercentages",
  [],
);

export const selectedLiftAtom = atomWithStorage<LiftOptions>(
  "selectedLift",
  "cleanAndJerk",
);

export const barbellWeightAtom = atom<number | null>(null);
