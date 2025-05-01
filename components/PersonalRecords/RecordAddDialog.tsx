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
import {
  addRecord,
  Exercises,
  PersonalRecordInfo,
} from "@/actions/user-settings-actions";
import { Input } from "../ui/input/input";
import { useState } from "react";
import { toast } from "sonner";

const RecordAddDialog = ({ exercises }: { exercises: Exercises[] }) => {
  const [record, setRecord] = useState<
    Pick<PersonalRecordInfo, "exerciseId" | "weight">
  >({
    exerciseId: 0,
    weight: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleAddRecord(
    record: Pick<PersonalRecordInfo, "exerciseId" | "weight">,
  ) {
    try {
      setIsLoading(true);
      await addRecord(record);
      toast.success("기록이 추가되었습니다.");
      setOpen(false);
    } catch {
      toast.error("기록 추가에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            exercises={exercises}
            onSelect={(id) => setRecord({ ...record, exerciseId: id })}
          />

          <Label htmlFor="weight">무게 (kg)</Label>

          <Input
            id="weight"
            value={record.weight ? record.weight : ""}
            type="number"
            placeholder="기록을 입력해 주세요."
            onChange={(e) => {
              console.log(e.target.valueAsNumber);
              setRecord({ ...record, weight: e.target.valueAsNumber });
            }}
          />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={!record.weight || !record.exerciseId}
            onClick={async () => await handleAddRecord(record)}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "저장중..." : "저장하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecordAddDialog;
