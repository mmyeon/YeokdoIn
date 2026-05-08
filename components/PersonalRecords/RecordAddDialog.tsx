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
      toast.success("Personal record added.");
      setOpen(false);
      setExerciseId(0);
    },
    () => toast.error("Failed to add personal record.")
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
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Record</DialogTitle>
          <DialogDescription>
            Enter exercise, weight, date, and optional note.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Label htmlFor="exercise">Exercise</Label>
          <WorkoutSelect
            selectedId={exerciseId || undefined}
            onSelect={(id) => setExerciseId(id)}
          />
        </div>

        <PRHistoryEntryEditor
          submitLabel="Save"
          isPending={addMutation.isPending}
          onSubmit={(draft) => {
            if (!exerciseId) {
              toast.error("Please select an exercise.");
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
