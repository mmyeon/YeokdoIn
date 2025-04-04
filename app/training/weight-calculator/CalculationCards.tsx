import { Card, CardContent } from "@/components/ui/card";
import { WeightList } from "@/types/training";
import { Dumbbell } from "lucide-react";
import { useAtomValue } from "jotai";
import { barWeightAtom } from "@/entities/training/atoms/liftsAtom";

const getWeightGap = (prevWeight: number, currentWeight: number) => {
  if (prevWeight === currentWeight) {
    return 0;
  }

  return prevWeight - currentWeight;
};

const CalculationCards = ({
  weightList,
  title,
}: {
  weightList: WeightList[];
  title: string;
}) => {
  const barWeight = useAtomValue(barWeightAtom);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-blue-500">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {weightList.map((item, index) => {
          const weightGap =
            index >= 1
              ? getWeightGap(
                  item.totalWeight,
                  weightList[index - 1].totalWeight,
                )
              : 0;

          return (
            <Card className="toss-card p-0 overflow-hidden" key={index}>
              <CardContent className="p-0">
                <div className="bg-blue-50 text-gray-800 p-3 flex justify-between items-center">
                  <h3 className="font-bold text-lg bg-blue-500 rounded-full text-white w-12 h-12 flex justify-center items-center tracking-wide">
                    {item.percent}%
                  </h3>

                  <div className="flex flex-col text-sm">
                    {weightGap !== 0 ? (
                      <>
                        {index >= 1 && (
                          <span>
                            이전 무게보다{" "}
                            <span
                              className={`text-xl ${weightGap > 0 ? "text-red-500" : "text-blue-500"} tracing-wide font-semibold`}
                            >
                              {weightGap > 0 ? "+" : "-"}
                              {Math.abs(weightGap)}
                              kg
                            </span>
                          </span>
                        )}
                      </>
                    ) : (
                      <span></span>
                    )}
                  </div>
                </div>

                <div className="p-6 text-center">
                  <span className="font-bold text-3xl">
                    {item.totalWeight}kg
                  </span>
                  <div className="flex justify-center items-center mt-1 gap-1">
                    <Dumbbell size={18} strokeWidth={1.1} />
                    <span>바벨에서</span>

                    {/* TODO: 바벨과의 무게 차이 정보 보여줄 지 고민*/}
                    <span
                      className={`${item.totalWeight - barWeight! > 0 ? "text-red-500" : "text-blue-500"} font-semibold text-sm`}
                    >
                      {item.totalWeight - barWeight! > 0 ? "+" : "-"}
                      {getWeightGap(item.totalWeight, barWeight!)}kg
                    </span>
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
