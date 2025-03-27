import { WeightList } from "@/types/training";

const getSizeFromWeight = (weight: number) => {
  if (weight >= 2.5) return 18;
  if (weight === 1.5) return 13;
  if (weight === 1) return 12;
  return 10;
};

const getPlateFontSize = (weight: number) => {
  if (weight >= 2.5) return "lg";
  return "xs";
};

const CalculateCard = ({ weightList }: { weightList: WeightList[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
      {weightList.map((item, index) => (
        <div
          className="border border-gray-200 rounded-xl overflow-hidden"
          key={index}
        >
          <div className="bg-gray-200 text-gray-800 p-6 flex justify-between items-center">
            <h3 className="font-bold text-2xl">{item.percent}%</h3>

            <div className="flex flex-col">
              <span className="font-bold text-xl">{item.totalWeight}kg</span>

              {index >= 1 && (
                <span>
                  {item.totalWeight - weightList[index - 1].totalWeight > 0
                    ? "+"
                    : ""}
                  {item.totalWeight - weightList[index - 1].totalWeight}
                  kg
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {item.plates.map((plateInfo, i) => {
              return (
                <div
                  key={i}
                  className="text-white rounded-full items-center justify-center inline-block size-10  ring-1 ring-white relative"
                  style={{
                    backgroundColor: plateInfo?.color,
                    width: `${0.25 * getSizeFromWeight(plateInfo.weight)}rem`,
                    height: `${0.25 * getSizeFromWeight(plateInfo.weight)}rem`,
                  }}
                >
                  <div className="flex items-center justify-center flex-col">
                    <span
                      className={`text-${getPlateFontSize(plateInfo.weight)} font-bold absolute top-1/2 left-1 transform -translate-y-1/2`}
                    >
                      {plateInfo.weight}
                    </span>
                    <span
                      className={`text-${getPlateFontSize(plateInfo.weight)} font-bold rotate-180 absolute top-1/2 right-1 transform -translate-y-1/2`}
                    >
                      {plateInfo.weight}
                    </span>
                    <span className="w-3 h-3 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalculateCard;
