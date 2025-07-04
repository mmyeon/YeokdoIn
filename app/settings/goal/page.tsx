"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Target, Info } from "lucide-react";
import BackButton from "@/components/BackButton";

interface Goal {
  id: string;
  goalText: string;
  createdAt: Date;
}

// TODO:  API 연동하고 삭제
const dummyData = [
  {
    id: "1",
    goalText: "스내치 PR 50kg",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    goalText: "데드리프트 100kg",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    goalText: "벤치프레스 80kg",
    createdAt: new Date("2024-02-01"),
  },
];

export default function PersonalGoals() {
  const [goals, setGoals] = useState<Goal[]>(dummyData);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    goalText: "",
  });

  const handleSave = () => {
    setIsEditing(false);
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        goalText: formData.goalText,
        createdAt: new Date(),
      },
    ]);
    setFormData({ goalText: "" });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ goalText: "" });
  };

  const handleAddNew = () => {
    setIsEditing(true);
  };

  return (
    <main className="container flex items-center justify-center mx-auto py-8 px-4 h-dvh">
      <div className="w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>{!isEditing && <BackButton />}</CardHeader>

          <CardContent>
            {goals.length === 0 && !isEditing && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">개인 목표 설정</h3>
                  <p className="text-muted-foreground mb-4">
                    구체적인 운동 계획으로 목표를 달성해 보세요!
                  </p>

                  <Button onClick={handleAddNew} className="mt-4">
                    <Target className="h-4 w-4 mr-2" />
                    목표 추가하기
                  </Button>
                </div>
              </div>
            )}

            {goals.length > 0 && !isEditing && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold mb-2">
                    목표 목록 ({`${goals.length}/3`})
                  </h3>

                  <Button onClick={handleAddNew} disabled={goals.length >= 3}>
                    <Target className="h-4 w-4 mr-2" />
                    추가
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  목표는 최대 3개까지 설정할 수 있습니다.
                </p>

                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {goals.map((goal) => (
                    <Card
                      key={goal.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm text-muted-foreground">
                            등록일: {goal.createdAt.toLocaleDateString("ko-KR")}
                          </p>

                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center ">
                          <p className="font-medium text-xl">{goal.goalText}</p>

                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {isEditing && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>주간 운동 계획</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalText">목표</Label>
                  <Textarea
                    id="goalText"
                    placeholder="예시: 스내치 44kg, 데드리프트 100kg"
                    value={formData.goalText}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        goalText: e.target.value,
                      }));
                    }}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    구체적이고 측정 가능한 목표를 설정하면 더 효과적입니다.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    disabled={!formData.goalText}
                    onClick={handleSave}
                  >
                    저장하기
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    취소
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
