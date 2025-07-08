"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import { useGoals } from "@/hooks/useGoals";
import { GoalEditForm, GoalList } from "./components";
import WelcomeMessage from "./components/WelcomeMessage";

export default function PersonalGoals() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: goals = [], isLoading } = useGoals();

  const handleAddNew = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
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

            {isEditing && <GoalEditForm onCancel={handleCancel} />}

            {!isEditing &&
              !isLoading &&
              (goals.length > 0 ? (
                <GoalList goals={goals} onAddNew={handleAddNew} />
              ) : (
                <WelcomeMessage onAddNew={handleAddNew} />
              ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
