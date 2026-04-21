"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddPRHistoryEntry,
  useDeletePRHistoryEntry,
  usePRHistory,
  useUpdatePRHistoryEntry,
} from "@/hooks/usePersonalRecords";
import PRHistoryEntryEditor from "./PRHistoryEntryEditor";
import { PRHistoryEntry } from "@/types/personalRecords";

interface PRTimelineDialogProps {
  exerciseId: number | null;
  exerciseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDelta(entry: PRHistoryEntry): { label: string; tone: "up" | "down" | "new" } {
  if (entry.previousWeight === null) return { label: "첫 기록", tone: "new" };
  const delta = entry.newWeight - entry.previousWeight;
  if (delta === 0) return { label: "±0kg", tone: "new" };
  const sign = delta > 0 ? "+" : "";
  return {
    label: `${sign}${delta}kg`,
    tone: delta > 0 ? "up" : "down",
  };
}

export default function PRTimelineDialog({
  exerciseId,
  exerciseName,
  open,
  onOpenChange,
}: PRTimelineDialogProps) {
  const { data: history = [], isLoading } = usePRHistory(
    open ? exerciseId : null
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const resetMode = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const addMutation = useAddPRHistoryEntry(
    () => {
      toast.success("기록이 추가되었습니다.");
      resetMode();
    },
    () => toast.error("기록 추가 중 오류가 발생했습니다.")
  );

  const updateMutation = useUpdatePRHistoryEntry(
    () => {
      toast.success("기록이 수정되었습니다.");
      resetMode();
    },
    () => toast.error("기록 수정 중 오류가 발생했습니다.")
  );

  const deleteMutation = useDeletePRHistoryEntry(
    () => toast.success("기록이 삭제되었습니다."),
    () => toast.error("기록 삭제 중 오류가 발생했습니다.")
  );

  async function handleDelete(entryId: number) {
    if (!window.confirm("이 기록을 삭제할까요?")) return;
    await deleteMutation.mutateAsync(entryId);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetMode();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{exerciseName} 이력</DialogTitle>
          <DialogDescription>
            최신 기록부터 순서대로 표시됩니다.
          </DialogDescription>
        </DialogHeader>

        {isAdding && exerciseId !== null && (
          <div className="border rounded-lg p-3">
            <PRHistoryEntryEditor
              submitLabel="추가"
              isPending={addMutation.isPending}
              onSubmit={(draft) =>
                addMutation.mutateAsync({
                  exerciseId,
                  newWeight: draft.newWeight,
                  prDate: draft.prDate,
                  note: draft.note,
                })
              }
              onCancel={() => setIsAdding(false)}
            />
          </div>
        )}

        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> 기록 추가
          </Button>
        )}

        <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-6">
              불러오는 중...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              아직 기록이 없습니다.
            </div>
          ) : (
            history.map((entry) => {
              const delta = formatDelta(entry);
              const isEditing = editingId === entry.id;
              return (
                <div
                  key={entry.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  {isEditing ? (
                    <PRHistoryEntryEditor
                      initial={{
                        newWeight: entry.newWeight,
                        prDate: entry.prDate,
                        note: entry.note,
                      }}
                      submitLabel="수정"
                      isPending={updateMutation.isPending}
                      onSubmit={(draft) =>
                        updateMutation.mutateAsync({
                          id: entry.id,
                          patch: {
                            newWeight: draft.newWeight,
                            prDate: draft.prDate,
                            note: draft.note,
                          },
                        })
                      }
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {entry.newWeight}kg
                          </span>
                          <Badge
                            variant={
                              delta.tone === "up"
                                ? "default"
                                : delta.tone === "down"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {delta.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {entry.prDate}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingId(entry.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {entry.note}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
