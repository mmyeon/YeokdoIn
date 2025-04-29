"use client";

import { saveBarbellWeight } from "@/actions/user-settings-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { barbellWeightAtom } from "@/entities/training/atoms/liftsAtom";
import { useAtom } from "jotai";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const weights = [
  { id: 7, label: "7kg" },
  { id: 15, label: "15kg" },
  { id: 20, label: "20kg" },
];

interface BarbellSettingProps {
  barbellWeight: number | null;
}

const BarbellSetting = ({ barbellWeight }: BarbellSettingProps) => {
  const [selectedWeight, setSelectedWeight] = useAtom(barbellWeightAtom);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (barbellWeight) setSelectedWeight(barbellWeight);
  }, [barbellWeight, setSelectedWeight]);

  async function handleSave() {
    try {
      setIsLoading(true);
      if (selectedWeight) await saveBarbellWeight(selectedWeight);
      toast.success("바벨 무게가 저장되었습니다.");
    } catch (error) {
      console.error("Error saving weight:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="toss-card p-4">
      <div className="flex flex-col items-start">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="뒤로 가기"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <h1 className="text-2xl font-bold">바벨 무게 설정</h1>
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
          disabled={isLoading || !selectedWeight}
        >
          {isLoading ? "저장 중..." : "저장하기"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BarbellSetting;
