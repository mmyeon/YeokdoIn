"use client";

import { History } from "lucide-react";
import { useState } from "react";
import { usePersonalRecords } from "@/hooks/usePersonalRecords";
import { PersonalRecordInfo } from "@/types/personalRecords";
import PRTimelineDialog from "./PRTimelineDialog";

const PersonalRecordList = () => {
  const [timelineTarget, setTimelineTarget] =
    useState<PersonalRecordInfo | null>(null);

  const { data: records = [], isLoading: isLoadingRecords } =
    usePersonalRecords();

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
