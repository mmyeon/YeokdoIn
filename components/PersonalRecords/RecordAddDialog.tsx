"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "../ui/input/label";
import WorkoutSelect from "./WorkoutSelect";
import { useState } from "react";
import { useAddPRHistoryEntry } from "@/hooks/usePersonalRecords";
import { toast } from "sonner";
import PRHistoryEntryEditor from "./PRHistoryEntryEditor";

interface RecordAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * 미등록 종목 행에서 열 때 그 종목을 미리 골라둔다. 종목을 다시 고르게 하면
   * 목록에서 이미 한 선택을 반복시키는 셈이다 (SC-001).
   *
   * 초기값으로만 쓰이므로, 프리셋이 바뀔 때는 호출부에서 `key` 로 remount 한다.
   */
  initialExerciseId?: number;
}

const RecordAddDialog = ({
  open,
  onOpenChange,
  initialExerciseId,
}: RecordAddDialogProps) => {
  const [exerciseId, setExerciseId] = useState<number>(initialExerciseId ?? 0);

  const addMutation = useAddPRHistoryEntry(
    () => {
      toast.success("PR을 등록했습니다.");
      onOpenChange(false);
    },
    () => toast.error("PR 등록에 실패했습니다.")
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>PR 등록</DialogTitle>
          <DialogDescription>
            종목과 무게, 날짜를 입력하세요. 메모는 선택입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Label htmlFor="exercise">종목</Label>
          <WorkoutSelect
            selectedId={exerciseId || undefined}
            onSelect={(id) => setExerciseId(id)}
          />
        </div>

        <PRHistoryEntryEditor
          submitLabel="저장"
          isPending={addMutation.isPending}
          onSubmit={(draft) => {
            if (!exerciseId) {
              toast.error("종목을 선택해주세요.");
              return;
            }
            addMutation.mutate({
              exerciseId,
              newWeight: draft.newWeight,
              prDate: draft.prDate,
              note: draft.note,
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RecordAddDialog;
