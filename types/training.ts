export type PersonalRecord = Record<Lift, string | undefined>;

export type Lift = "cleanAndJerk" | "snatch";

export type LiftOptions = Lift | "both";

export type WeightPercentage = {
  id: number;
  percent: number;
};

export interface WeightList extends WeightPercentage {
  totalWeight: number;
  plates: Plates;
}

export type Plates = number[];

export type LiftInfo = {
  value: Lift;
  label: string;
};
