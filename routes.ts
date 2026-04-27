export const ROUTES = {
  TRAINING: {
    PROGRAM_INPUT: "/training/program-input",
    PROGRAM_RUNNER: (id: number | string) => `/training/program-runner/${id}`,
    MOVEMENT_ANALYSIS: "/training/movement-analysis",
    WEIGHT_CALCULATOR: "/training/weight-calculator",
  },
  AUTH: {
    LOGIN: "/login",
    CALLBACK: "/auth/callback",
  },
  HOME: "/",
  SETTINGS: {
    ROOT: "/settings",
    PERSONAL_RECORD: "/settings/personal-records",
    PERSONAL_RECORD_DETAIL: (id: number | string) =>
      `/settings/personal-records/${id}`,
    BARBELL_WEIGHT: "/settings/barbell-weight",
  },
};

export const REDIRECT_TO_KEY = "redirectTo";
