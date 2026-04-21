"use client";

import { Button } from "../ui/button";
import { History, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  usePersonalRecords,
  useDeletePersonalRecord,
} from "@/hooks/usePersonalRecords";
import { toast } from "sonner";
import { PersonalRecordInfo } from "@/types/personalRecords";
import PRTimelineDialog from "./PRTimelineDialog";

const PersonalRecordList = () => {
  const [timelineTarget, setTimelineTarget] =
    useState<PersonalRecordInfo | null>(null);

  const { data: records = [], isLoading: isLoadingRecords } =
    usePersonalRecords();

  const deleteRecordMutation = useDeletePersonalRecord(
    () => toast.success("개인 기록이 삭제되었습니다."),
    () => toast.error("개인 기록 삭제 중 오류가 발생했습니다.")
  );

  async function handleDeleteRecord(
    record: PersonalRecordInfo,
    event: React.MouseEvent
  ) {
    event.stopPropagation();
    const ok = window.confirm(
      `${record.exerciseName}의 모든 기록을 삭제할까요? 이력 포함 삭제됩니다.`
    );
    if (!ok) return;
    await deleteRecordMutation.mutateAsync(record.id);
  }

  if (isLoadingRecords) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 max-h-[300px] overflow-scroll">
        {records.map((record) => (
          <div
            key={record.id}
            role="button"
            tabIndex={0}
            onClick={() => setTimelineTarget(record)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTimelineTarget(record);
              }
            }}
            className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="font-medium">{record.exerciseName}</div>
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground">{record.weight} kg</div>
              <History className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteRecord(record, e)}
                disabled={deleteRecordMutation.isPending}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <PRTimelineDialog
        exerciseId={timelineTarget?.exerciseId ?? null}
        exerciseName={timelineTarget?.exerciseName ?? ""}
        open={timelineTarget !== null}
        onOpenChange={(open) => {
          if (!open) setTimelineTarget(null);
        }}
      />
    </>
  );
};

export default PersonalRecordList;
