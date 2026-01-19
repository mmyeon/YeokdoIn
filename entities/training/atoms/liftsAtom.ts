import { atomWithStorage } from "jotai/utils";
import { PersonalRecord, WeightPercentage } from "@/types/training";
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

export const personalRecordsAtom = atom<PersonalRecordInfo | null>(null);
