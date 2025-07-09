"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import { useGoals } from "@/hooks/useGoals";
import { GoalEditForm, GoalList } from "./components";
import WelcomeMessage from "./components/WelcomeMessage";

export default function PersonalGoals() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState<number | null>(null);
  const { data: goals = [], isLoading } = useGoals();

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
  };

  const handleEditGoalId = (id: number | null) => {
    setCurrentEditingId(id);
  };

  return (
    <main className="container flex items-center justify-center mx-auto py-8 px-4 h-dvh">
      <div className="w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>{!isEditing && <BackButton />}</CardHeader>

          <CardContent>
            {isLoading && (
              <div className="text-center py-8">
                목표를 불러오는 중입니다...
              </div>
            )}

            {isEditing && (
              <GoalEditForm
                toggleEdit={toggleEditMode}
                editId={currentEditingId}
                handleEditGoalId={handleEditGoalId}
              />
            )}

            {!isEditing &&
              !isLoading &&
              (goals.length > 0 ? (
                <GoalList
                  goals={goals}
                  toggleEditMode={toggleEditMode}
                  handleEditGoalId={handleEditGoalId}
                />
              ) : (
                <WelcomeMessage onAddNew={toggleEditMode} />
              ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
