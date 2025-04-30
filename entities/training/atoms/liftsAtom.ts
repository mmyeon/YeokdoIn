import { atomWithStorage } from "jotai/utils";
import {
  LiftOptions,
  PersonalRecord,
  WeightPercentage,
} from "@/types/training";
import { atom } from "jotai";
import { PersonalRecordInfo } from "@/actions/user-settings-actions";

// TODO: DB 연동하고 나서 삭제
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

export const personalRecordsAtom = atom<PersonalRecordInfo | null>(null);
