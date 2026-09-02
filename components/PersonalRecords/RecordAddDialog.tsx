"use client";

import { Plus } from "lucide-react";
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
      toast.success("PR을 등록했습니다.");
      setOpen(false);
      setExerciseId(0);
    },
    () => toast.error("PR 등록에 실패했습니다.")
  );

  function handleToggleDialog(nextOpen: boolean) {
    if (!nextOpen) setExerciseId(0);
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleToggleDialog}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 px-2 text-yd-primary font-semibold"
        >
          <Plus className="size-3.5" aria-hidden />
          추가
        </Button>
      </DialogTrigger>
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
