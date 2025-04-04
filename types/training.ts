export type PersonalRecord = {
  clean?: string;
  snatch?: string;
};

export type Lift = "clean-and-jerk" | "snatch" | "both";

export type WeightPercentage = {
  id: number;
  percent: number;
};

export interface WeightList extends WeightPercentage {
  totalWeight: number;
  plates: Plates;
}

export type Plates = number[];

export type TabInfo = {
  value: "clean" | "snatch";
  label: string;
};
