"use client";

import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

interface WelcomeMessageProps {
  onAddNew: () => void;
}

export default function WelcomeMessage({ onAddNew }: WelcomeMessageProps) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
        <Target className="h-8 w-8 text-blue-600" />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">개인 목표 설정</h3>
        <p className="text-muted-foreground mb-4">
          구체적인 운동 계획으로 목표를 달성해 보세요!
        </p>

        <Button onClick={onAddNew} className="mt-4">
          <Target className="h-4 w-4 mr-2" />
          목표 추가하기
        </Button>
      </div>
    </div>
  );
}
