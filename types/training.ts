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
  plates: PlateOption[];
}

export type PlateOption = {
  weight: number;
  color: string;
};
