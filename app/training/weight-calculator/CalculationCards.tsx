import { Card, CardContent } from "@/components/ui/card";
import { Lift, WeightList } from "@/types/training";
import { ArrowDown, ArrowUp, Trophy } from "lucide-react";
import { useAtomValue } from "jotai";
import { personalRecordAtom } from "@/entities/training/atoms/liftsAtom";
import { LIFT_INFO_MAP } from "@/shared/constants";
import PlateVisualizer from "@/components/PlateVisualizer";

const getWeightGap = (prevWeight: number, currentWeight: number) => {
  if (prevWeight === currentWeight) {
    return 0;
  }

  return prevWeight - currentWeight;
};

const CalculationCards = ({
  weightList,
  lift,
}: {
  weightList: WeightList[];
  lift: Lift;
}) => {
  const personalRecord = useAtomValue(personalRecordAtom);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 items-center justify-end">
        <Trophy className="w-4 h-4 mr-1 text-yellow-500" />

        <h3 className="text-sm font-semibold">{`개인기록 : ${personalRecord[lift]}kg`}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {weightList.map((item, index) => {
          const weightGap =
            index >= 1
              ? getWeightGap(
                  item.totalWeight,
                  weightList[index - 1].totalWeight
                )
              : 0;

          return (
            <Card className="toss-card p-0 overflow-hidden" key={index}>
              <CardContent className="p-0">
                <div className="bg-blue-500 flex justify-between items-center p-3">
                  <h3 className="font-bold text-lg text-white">
                    {LIFT_INFO_MAP[lift]}
                  </h3>

                  <span className="bg-white text-blue-500 font-semibold rounded-lg px-2 text-sm">
                    {item.percent}%
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-start flex-col">
                    <span className="font-bold text-3xl mb-1">
                      {item.totalWeight}kg
                    </span>

                    <span
                      className={`flex items-center ${weightGap > 0 ? "text-red-500" : "text-blue-500"} gap-0.5 text-sm`}
                    >
                      <span
                        className={`flex items-center ${weightGap > 0 ? "text-red-500" : "text-blue-500"} gap-0.5 text-sm`}
                      >
                        <div className="min-h-[24px] flex items-center">
                          {" "}
                          {weightGap !== 0 && (
                            <>
                              <span>이전 무게보다 {Math.abs(weightGap)}kg</span>
                              {weightGap > 0 ? (
                                <ArrowUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ArrowDown className="w-4 h-4 ml-1" />
                              )}
                            </>
                          )}
                        </div>
                      </span>
                    </span>

                    <PlateVisualizer oneSidePlates={item.plates} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CalculationCards;
