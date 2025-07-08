"use client";

import { Button } from "../ui/button";
import { Edit2, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input/input";
import {
  usePersonalRecords,
  useUpdatePersonalRecord,
  useDeletePersonalRecord,
} from "@/hooks/usePersonalRecords";
import { toast } from "sonner";
import { PersonalRecordInfo } from "@/types/personalRecords";

const PersonalRecordList = () => {
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [newRecordWeight, setNewRecordWeight] = useState<number | null>(null);

  const { data: records = [], isLoading: isLoadingRecords } =
    usePersonalRecords();
  const updateRecordMutation = useUpdatePersonalRecord(
    () => toast.success("개인 기록이 수정되었습니다."),
    () => toast.error("개인 기록 수정 중 오류가 발생했습니다."),
  );
  const deleteRecordMutation = useDeletePersonalRecord(
    () => toast.success("개인 기록이 삭제되었습니다."),
    () => toast.error("개인 기록 삭제 중 오류가 발생했습니다."),
  );

  function cancelEditing() {
    setSelectedRecordId(null);
    setNewRecordWeight(null);
  }

  function startEditing(record: PersonalRecordInfo) {
    setSelectedRecordId(record.id);
  }

  async function handleUpdatePR(value: number) {
    if (!selectedRecordId) return;

    await updateRecordMutation.mutateAsync({
      recordId: selectedRecordId,
      newWeight: value,
    });

    setSelectedRecordId(null);
    setNewRecordWeight(null);
  }

  async function handleDeleteRecord(recordId: number) {
    await deleteRecordMutation.mutateAsync(recordId);
  }

  if (isLoadingRecords) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-[300px] overflow-scroll">
      {records.map((record) => (
        <div key={record.id} className="space-y-2">
          {selectedRecordId === record.id ? (
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{record.exerciseName} 무게 수정</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  id="edit-weight"
                  type="number"
                  value={newRecordWeight ?? record.weight}
                  placeholder="무게를 입력하세요"
                  onChange={(e) => setNewRecordWeight(e.target.valueAsNumber)}
                />
              </div>

              <Button
                className="w-full"
                onClick={async () => await handleUpdatePR(newRecordWeight!)}
                disabled={
                  newRecordWeight === record.weight ||
                  updateRecordMutation.isPending
                }
              >
                <Save className="h-4 w-4 mr-2" />{" "}
                {updateRecordMutation.isPending ? "저장중..." : "저장하기"}
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium">{record.exerciseName}</div>

              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">{record.weight} kg</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(record)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => await handleDeleteRecord(record.id)}
                  disabled={deleteRecordMutation.isPending}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PersonalRecordList;
