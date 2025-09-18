import { atomWithStorage } from "jotai/utils";
import {
  LiftOptions,
  PersonalRecord,
  WeightPercentage,
} from "@/types/training";
import { atom } from "jotai";
import { PersonalRecordInfo } from "@/types/personalRecords";

// TODO: DB 연동하고 나서 삭제
export const personalRecordAtom = atomWithStorage<PersonalRecord>(
  "personalRecord",
  {
    cleanAndJerk: "",
    snatch: "",
  }
);

export const programPercentagesAtom = atomWithStorage<WeightPercentage[]>(
  "programPercentages",
  []
);

export const selectedLiftAtom = atomWithStorage<LiftOptions>(
  "selectedLift",
  "cleanAndJerk"
);
// TODO: 프로그램 무게 계산 페이지 개선 후 삭제
export const barbellWeightAtom = atom<number | null>(null);

export const personalRecordsAtom = atom<PersonalRecordInfo | null>(null);
