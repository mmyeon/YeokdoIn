import { Plates } from "@/types/training";

const PLATE_SIZE: Record<number, string> = {
  25: "w-20 h-20",
  20: "w-[72px] h-[72px]",
  15: "w-16 h-16",
  10: "w-14 h-14",
  5: "w-12 h-12",
  2.5: "w-10 h-10",
  2: "w-9 h-9",
  1.5: "w-8 h-8",
  1: "w-7 h-7",
  0.5: "w-6 h-6",
};

const PLATE_COLORS: Record<
  number,
  {
    color: string;
    borderColor: string;
    label: string;
    height: string;
    width: string;
  }
> = {
  25: {
    color: "bg-red-900",
    borderColor: "border-red-800",
    label: "25kg",
    height: "h-20",
    width: "w-4",
  },
  20: {
    color: "bg-blue-900",
    borderColor: "border-blue-800",
    label: "20kg",
    height: "h-[72px]",
    width: "w-4",
  },
  15: {
    color: "bg-yellow-500",
    borderColor: "border-yellow-700",
    label: "15kg",
    height: "h-16",
    width: "w-3",
  },
  10: {
    color: "bg-green-600",
    borderColor: "border-green-800",
    label: "10kg",
    height: "h-14",
    width: "w-3",
  },
  5: {
    color: "bg-white",
    borderColor: "border-gray-400",
    label: "5kg",
    height: "h-12",
    width: "w-2.5",
  },
  2.5: {
    color: "bg-red-600",
    borderColor: "border-red-600",
    label: "2.5kg",
    height: "h-10",
    width: "w-2",
  },
  2: {
    color: "bg-blue-600",
    borderColor: "border-blue-600",
    label: "2kg",
    height: "h-9",
    width: "w-2",
  },
  1.5: {
    color: "bg-yellow-400",
    borderColor: "border-yellow-600",
    label: "1.5kg",
    height: "h-8",
    width: "w-1.5",
  },
  1: {
    color: "bg-green-400",
    borderColor: "border-green-600",
    label: "1kg",
    height: "h-7",
    width: "w-1.5",
  },
  0.5: {
    color: "bg-gray-400",
    borderColor: "border-gray-600",
    label: "0.5kg",
    height: "h-6",
    width: "w-1",
  },
};

interface PlateVisualizerProps {
  oneSidePlates: Plates;
}

const PlateVisualizer = ({ oneSidePlates }: PlateVisualizerProps) => {
  if (!oneSidePlates || oneSidePlates.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        플레이트가 필요하지 않습니다
      </div>
    );
  }

  // 한쪽 플레이트 총무게 계산
  const totalOneSideWeight = oneSidePlates.reduce(
    (sum, plate) => sum + plate,
    0
  );

  return (
    <div className="relative space-y-4 w-full ">
      {/* 측면 뷰 - 바벨 + 플레이트 */}
      <div className="flex items-center h-24">
        {/* 바벨 바 */}
        <div className="absolute left-0 h-3 right-0 bg-gray-700 rounded-1xl shadow-md z-0 border-2 border-gray-900" />

        {/* 플레이트들 (겹쳐지도록 absolute) */}
        <div className="absolute left-30 flex items-center">
          {oneSidePlates.map((plate, index) => {
            const plateConfig = PLATE_COLORS[plate];
            if (!plateConfig) return null;

            return (
              <div
                key={index}
                className={`${plateConfig.color} ${plateConfig.height} ${plateConfig.width} rounded-md ${plateConfig.borderColor} group transition-transform hover:scale-105 hover:z-50 border-2`}
                title={plateConfig.label}
              ></div>
            );
          })}
        </div>
      </div>

      {/* 정면 뷰 - 플레이트 원형 */}
      <div className="flex flex-wrap gap-2 flex-col">
        <div className="text-sm font-semibold text-gray-700">
          한쪽 플레이트 총무게: {totalOneSideWeight}kg
        </div>

        <div className="flex items-center gap-2">
          {oneSidePlates.map((plate, index) => {
            const plateConfig = PLATE_COLORS[plate];
            if (!plateConfig) return null;

            return (
              <div
                key={index}
                className={`${plateConfig.color} ${PLATE_SIZE[plate]} rounded-full border-2 ${plateConfig.borderColor} relative flex items-center justify-center group transition-transform`}
              >
                {/* 중앙 구멍 */}
                <div className="bg-white rounded-full w-1/2 h-1/2 border-2" />

                {/* 무게 표시 */}
                <span className="absolute inset-0 flex items-center justify-center text-black font-bold text-xs drop-shadow-lg pointer-events-none">
                  {plate}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlateVisualizer;
