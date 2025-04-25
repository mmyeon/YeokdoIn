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

// TODO: 프로그램 무게 계산 로직 변경하고 삭제
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
