"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "../ui/input/label";
import { Save } from "lucide-react";
import WorkoutSelect from "./WorkoutSelect";
import { PersonalRecordInfo } from "@/types/personalRecords";
import { Input } from "../ui/input/input";
import { useState } from "react";
import {
  useAddPersonalRecord,
  usePersonalRecords,
} from "@/hooks/usePersonalRecords";
import { toast } from "sonner";

const RecordAddDialog = () => {
  const [record, setRecord] = useState<
    Pick<PersonalRecordInfo, "exerciseId" | "weight">
  >({
    exerciseId: 0,
    weight: 0,
  });
  const [open, setOpen] = useState(false);

  const { data: existingRecords = [] } = usePersonalRecords();

  const addRecordMutation = useAddPersonalRecord(
    () => {
      const existingRecord = existingRecords.find(
        (r) => r.exerciseId === record.exerciseId
      );

      console.log(existingRecord);
      toast.success(
        existingRecord
          ? "기존 기록이 변경되었습니다."
          : "개인 기록이 추가되었습니다."
      );
    },
    () => toast.error("개인 기록 추가 중 오류가 발생했습니다.")
  );

  async function handleAddRecord(
    record: Pick<PersonalRecordInfo, "exerciseId" | "weight">
  ) {
    await addRecordMutation.mutateAsync(record);
    setOpen(false);
    setRecord({ exerciseId: 0, weight: 0 });
  }

  function handleToggleDialog(openCondition: boolean) {
    if (!openCondition) setRecord({ exerciseId: 0, weight: 0 });

    setOpen(openCondition);
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
            운동 종목과 기록을 입력해 주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 grid-rows-2 items-center gap-4">
          <Label htmlFor="exercise">운동 종목</Label>

          <WorkoutSelect
            onSelect={(id) => setRecord({ ...record, exerciseId: id })}
          />

          <Label htmlFor="weight">무게 (kg)</Label>

          <Input
            id="weight"
            value={record.weight ? record.weight : ""}
            type="number"
            placeholder="기록을 입력해 주세요."
            onChange={(e) => {
              setRecord({ ...record, weight: e.target.valueAsNumber });
            }}
          />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={
              !record.weight ||
              !record.exerciseId ||
              addRecordMutation.isPending
            }
            onClick={async () => await handleAddRecord(record)}
          >
            <Save className="h-4 w-4 mr-2" />
            {addRecordMutation.isPending ? "저장중..." : "저장하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecordAddDialog;
