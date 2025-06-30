export const ROUTES = {
  TRAINING: {
    SELECT_LIFT: "/training/select-lift",
    PERSONAL_RECORD: "/training/personal-record",
    PROGRAM_INPUT: "/training/program-input",
    POSTURE_ANALYSIS: "/training/posture-analysis",
    WEIGHT_CALCULATOR: "/training/weight-calculator",
  },
  AUTH: {
    LOGIN: "/login",
    CALLBACK: "/auth/callback",
  },
  HOME: "/",
  SETTINGS: {
    ROOT: "/settings",
    GOAL: "/settings/goal",
    PERSONAL_RECORD: "/settings/personal-records",
    BARBELL_WEIGHT: "/settings/barbell-weight",
  },
};


export const REDIRECT_TO_KEY = "redirectTo";

// React Query에서 쿼리를 식별하는 데 사용되는 키 모음
export const QUERY_KEYS = {
  PERSONAL_RECORDS: ["personalRecords"],
  EXERCISES: ["exercises"],
  USER_SETTINGS: ["userSettings"],
};