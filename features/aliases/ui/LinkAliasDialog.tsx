"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/input/label";
import WorkoutSelect from "@/components/PersonalRecords/WorkoutSelect";
import { toast } from "sonner";
import { useUpsertAlias } from "@/features/aliases/ui/useAliases";
import { isValidAlias } from "@/features/aliases/model/normalize";

interface LinkAliasDialogProps {
  trigger?: React.ReactNode;
  defaultAlias?: string;
  defaultExerciseId?: number;
  onLinked?: () => void;
}

/**
 * "이 이름을 운동 종목에 연결하기" 인라인 다이얼로그.
 * 프로그램 입력 화면 등 미지의 표기를 만났을 때 즉시 매핑하도록 사용된다.
 */
function LinkAliasDialog({
  trigger,
  defaultAlias = "",
  defaultExerciseId,
  onLinked,
}: LinkAliasDialogProps) {
  const [open, setOpen] = useState(false);
  const [alias, setAlias] = useState(defaultAlias);
  const [exerciseId, setExerciseId] = useState<number | undefined>(
    defaultExerciseId
  );

  const upsert = useUpsertAlias(
    () => {
      toast.success("별명이 저장되었습니다.");
      setOpen(false);
      setAlias(defaultAlias);
      setExerciseId(defaultExerciseId);
      onLinked?.();
    },
    (error) => toast.error(error.message ?? "별명 저장 중 오류가 발생했습니다.")
  );

  function handleSubmit() {
    if (!isValidAlias(alias)) {
      toast.error("별명을 1자 이상 50자 이하로 입력해 주세요.");
      return;
    }
    if (!exerciseId) {
      toast.error("운동 종목을 선택해 주세요.");
      return;
    }
    upsert.mutate({ alias, exerciseId });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button className="w-fit">별명 연결</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>별명 연결하기</DialogTitle>
          <DialogDescription>
            프로그램에서 사용하는 표기를 운동 종목과 매핑합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Label htmlFor="alias">별명</Label>
          <Input
            id="alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="예: 스내치, SN, 인상"
            maxLength={50}
          />

          <Label htmlFor="exercise">운동 종목</Label>
          <WorkoutSelect
            selectedId={exerciseId}
            onSelect={(id) => setExerciseId(id)}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={upsert.isPending}
            className="w-full"
          >
            {upsert.isPending ? "저장 중..." : "저장하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LinkAliasDialog;
