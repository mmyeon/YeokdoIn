"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useBarbellWeight,
  useSaveBarbellWeight,
} from "@/hooks/useBarbellWeight";
import { useEffect } from "react";
import { toast } from "sonner";
import BackButton from "./BackButton";
import { useAtom } from "jotai";
import { barbellWeightAtom } from "@/entities/training/atoms/liftsAtom";

const weights = [
  { id: 7, label: "7kg" },
  { id: 15, label: "15kg" },
  { id: 20, label: "20kg" },
];

const BarbellSetting = () => {
  const [selectedWeight, setSelectedWeight] = useAtom(barbellWeightAtom);

  const { data: barbellData, isLoading: isLoadingData } = useBarbellWeight();
  const { mutate: saveWeight, isPending: isSaving } = useSaveBarbellWeight();

  //
  useEffect(() => {
    if (barbellData) setSelectedWeight(barbellData.default_barbell_weight);
  }, [barbellData, setSelectedWeight]);

  async function handleSave() {
    if (!selectedWeight) return;

    saveWeight(selectedWeight, {
      onSuccess: () => {
        toast.success("바벨 무게가 저장되었습니다.");
      },
      onError: (error) => {
        console.error("Error saving weight:", error);
        toast.error("저장 중 오류가 발생했습니다.");
      },
    });
  }

  // TODO: 페이지 전체 뒤로가기 버튼과 타이틀 간의 간격 통일
  if (isLoadingData) {
    return (
      <Card className="toss-card p-4">
        <div className="flex flex-col items-start mt-4 mb-2">
          <BackButton />
          <h1 className="text-2xl font-bold">바벨 무게 설정</h1>
        </div>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="toss-card p-4">
      <div className="flex flex-col items-start">
        <BackButton />

        <h1 className="text-2xl font-bold mt-4 mb-2">바벨 무게 설정</h1>
      </div>

      <CardContent>
        <div className="flex flex-wrap gap-3 mb-6">
          {weights.map((weight) => (
            <Badge
              key={weight.id}
              variant={selectedWeight === weight.id ? "default" : "outline"}
              className={`text-md py-2 px-4 cursor-pointer ${selectedWeight === weight.id ? "bg-primary" : ""}`}
              onClick={() => setSelectedWeight(weight.id)}
            >
              {weight.label}
            </Badge>
          ))}
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleSave}
          disabled={
            isSaving ||
            !selectedWeight ||
            selectedWeight === barbellData?.default_barbell_weight
          }
        >
          {isSaving ? "저장 중..." : "저장하기"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BarbellSetting;
