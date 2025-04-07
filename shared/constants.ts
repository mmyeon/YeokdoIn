import { Lift, LiftInfo } from "@/types/training";

export const LIFT_INFO: LiftInfo[] = [
  { value: "cleanAndJerk", label: "클린 앤 저크" },
  { value: "snatch", label: "스내치" },
];

export const LIFT_INFO_MAP = LIFT_INFO.reduce(
  (acc, { value, label }) => ({ ...acc, [value]: label }),
  {} as Record<Lift, string>,
);
