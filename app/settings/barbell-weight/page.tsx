"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { atom, useAtom } from "jotai";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

const weights = [
  { id: "7kg", label: "7kg" },
  { id: "15kg", label: "15kg" },
  { id: "20kg", label: "20kg" },
];

const barbellAtom = atom<string | null>(null);

const BarbellSetting = () => {
  const [selectedWeight, setSelectedWeight] = useAtom(barbellAtom);
  const [isLoading, setIsLoading] = useState(false);

  function handleSave() {
    try {
      setIsLoading(true);
    } catch (error) {
      console.error("Error saving weight:", error);
    }
  }

  return (
    <main className="flex items-center justify-center p-4 h-dvh max-w-sm relative">
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
    </main>
  );
};

export default BarbellSetting;
