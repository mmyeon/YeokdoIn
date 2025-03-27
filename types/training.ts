export type PersonalRecord = {
  clean?: number;
  snatch?: number;
};

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
