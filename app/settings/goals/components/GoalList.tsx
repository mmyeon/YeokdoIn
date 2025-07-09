"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteGoal } from "@/hooks/useGoals";
import { Goal } from "@/types/goal";
import { Edit, Trash2, Info } from "lucide-react";
import { toast } from "sonner";

interface GoalListProps {
  goals: Goal[];
  toggleEditMode: () => void;
  handleEditGoalId: (id: number | null) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("ko-KR", options).format(date);
};

export default function GoalList({
  goals,
  toggleEditMode,
  handleEditGoalId,
}: GoalListProps) {
  const { mutate: deleteGoal } = useDeleteGoal({
    onSuccess: () => {
      toast.success("목표가 삭제되었습니다.");
    },
  });

  const handleEditGoal = (id: number) => {
    handleEditGoalId(id);
    toggleEditMode();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold mb-2">
          목표 목록 ({`${goals.length}/3`})
        </h3>

        <Button onClick={toggleEditMode} disabled={goals.length >= 3}>
          추가
        </Button>
      </div>

      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Info className="h-4 w-4" />
        목표는 최대 3개까지 설정할 수 있습니다.
      </p>

      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {goals.map(({ id, content, created_at }) => (
          <Card key={id} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-muted-foreground">
                  등록일: {formatDate(created_at)}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteGoal(id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center ">
                <p className="font-medium text-xl">{content}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditGoal(id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
