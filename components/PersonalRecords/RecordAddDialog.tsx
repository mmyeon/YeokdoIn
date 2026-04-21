"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "../ui/input/label";
import WorkoutSelect from "./WorkoutSelect";
import { useState } from "react";
import { useAddPRHistoryEntry } from "@/hooks/usePersonalRecords";
import { toast } from "sonner";
import PRHistoryEntryEditor from "./PRHistoryEntryEditor";

const RecordAddDialog = () => {
  const [exerciseId, setExerciseId] = useState<number>(0);
  const [open, setOpen] = useState(false);

  const addMutation = useAddPRHistoryEntry(
    () => {
      toast.success("개인 기록이 추가되었습니다.");
      setOpen(false);
      setExerciseId(0);
    },
    () => toast.error("개인 기록 추가 중 오류가 발생했습니다.")
  );

  function handleToggleDialog(nextOpen: boolean) {
    if (!nextOpen) setExerciseId(0);
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleToggleDialog}>
      <DialogTrigger asChild>
        <Button className="w-fit">추가</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>기록 추가하기</DialogTitle>
          <DialogDescription>
            운동 종목, 무게, 날짜, 메모(선택)를 입력해 주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Label htmlFor="exercise">운동 종목</Label>
          <WorkoutSelect onSelect={(id) => setExerciseId(id)} />
        </div>

        <PRHistoryEntryEditor
          submitLabel="저장하기"
          isPending={addMutation.isPending}
          onSubmit={async (draft) => {
            if (!exerciseId) {
              toast.error("운동 종목을 선택해 주세요.");
              return;
            }
            await addMutation.mutateAsync({
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
