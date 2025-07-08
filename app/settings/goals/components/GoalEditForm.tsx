"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import { useAddGoal } from "@/hooks/useGoals";
import { toast } from "sonner";

interface GoalEditFormProps {
  onCancel: () => void;
}

export default function GoalEditForm({ onCancel }: GoalEditFormProps) {
  const [goalContent, setGoalContent] = useState("");

  const { mutate: addGoal } = useAddGoal({
    onSuccess: () => {
      toast.success("목표가 추가되었습니다.");
    },
  });

  const handleSave = () => {
    addGoal(goalContent);
    setGoalContent("");
    onCancel();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>주간 운동 계획</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goalText">목표</Label>
        <Textarea
          id="goalText"
          placeholder="예시: 스내치 44kg, 데드리프트 100kg"
          value={goalContent}
          onChange={(e) => setGoalContent(e.target.value)}
          rows={3}
        />
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Info className="h-4 w-4" />
          구체적이고 측정 가능한 목표를 설정하면 더 효과적입니다.
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button className="flex-1" disabled={!goalContent} onClick={handleSave}>
          저장하기
        </Button>
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
      </div>
    </div>
  );
}
