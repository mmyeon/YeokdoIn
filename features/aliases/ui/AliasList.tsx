"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import WorkoutSelect from "@/components/PersonalRecords/WorkoutSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useAliases,
  useDeleteAlias,
  useUpsertAlias,
} from "@/features/aliases/ui/useAliases";
import { AliasWithExercise } from "@/features/aliases/types";
import { isValidAlias } from "@/features/aliases/model/normalize";
import { Pencil, Trash2, X, Check, Plus } from "lucide-react";

/**
 * 별명 목록 관리 컴포넌트. 추가/수정/삭제 기능 제공.
 */
function AliasList() {
  const { data: aliases = [], isLoading, isError, refetch } = useAliases();
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          별명을 불러오지 못했습니다.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="w-4 h-4 mr-1" /> 추가
        </Button>
      </div>

      {isAdding && <AliasEditRow onClose={() => setIsAdding(false)} />}

      {aliases.length === 0 && !isAdding ? (
        <p className="text-center text-muted-foreground py-8">
          저장된 별명이 없습니다.
          <br />
          추가 버튼을 눌러 프로그램 표기를 매핑해 보세요.
        </p>
      ) : (
        <ul className="divide-y">
          {aliases.map((alias) => (
            <AliasItem key={alias.id} alias={alias} />
          ))}
        </ul>
      )}
    </div>
  );
}

interface AliasItemProps {
  alias: AliasWithExercise;
}

function AliasItem({ alias }: AliasItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteMutation = useDeleteAlias(
    () => toast.success("별명이 삭제되었습니다."),
    (error) => toast.error(error.message ?? "삭제 중 오류가 발생했습니다.")
  );

  if (isEditing) {
    return (
      <li className="py-3">
        <AliasEditRow
          initial={alias}
          onClose={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between py-3 gap-2">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{alias.alias}</p>
        <p className="text-sm text-muted-foreground truncate">
          → {alias.exerciseName}
        </p>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          aria-label="수정"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={deleteMutation.isPending}
              aria-label="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                정말 이 별명을 삭제하시겠습니까?
              </AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{alias.alias}&rdquo; 별명이 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(alias.id)}
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

interface AliasEditRowProps {
  initial?: AliasWithExercise;
  onClose: () => void;
}

function AliasEditRow({ initial, onClose }: AliasEditRowProps) {
  const [aliasText, setAliasText] = useState(initial?.alias ?? "");
  const [exerciseId, setExerciseId] = useState<number | undefined>(
    initial?.exerciseId
  );

  const upsert = useUpsertAlias(
    () => {
      toast.success(initial ? "별명이 수정되었습니다." : "별명이 추가되었습니다.");
      onClose();
    },
    (error) => toast.error(error.message ?? "저장 중 오류가 발생했습니다.")
  );

  function handleSave() {
    if (!isValidAlias(aliasText)) {
      toast.error("별명을 1자 이상 50자 이하로 입력해 주세요.");
      return;
    }
    if (!exerciseId) {
      toast.error("운동 종목을 선택해 주세요.");
      return;
    }
    upsert.mutate({ id: initial?.id, alias: aliasText, exerciseId });
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 py-2">
      <Input
        value={aliasText}
        onChange={(e) => setAliasText(e.target.value)}
        placeholder="별명"
        maxLength={50}
      />
      <WorkoutSelect
        selectedId={exerciseId}
        onSelect={(id) => setExerciseId(id)}
      />
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          disabled={upsert.isPending}
          aria-label="저장"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="취소"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default AliasList;
