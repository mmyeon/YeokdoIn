"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/input/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { useState } from "react";

export type PRHistoryEntryDraft = {
  newWeight: number;
  prDate: string;
  note: string | null;
};

interface PRHistoryEntryEditorProps {
  initial?: Partial<PRHistoryEntryDraft>;
  submitLabel?: string;
  isPending?: boolean;
  onSubmit: (draft: PRHistoryEntryDraft) => void | Promise<void>;
  onCancel?: () => void;
}

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function PRHistoryEntryEditor({
  initial,
  submitLabel = "저장하기",
  isPending,
  onSubmit,
  onCancel,
}: PRHistoryEntryEditorProps) {
  const [weight, setWeight] = useState<number | "">(
    initial?.newWeight ?? ""
  );
  const [prDate, setPrDate] = useState<string>(initial?.prDate ?? todayISO());
  const [note, setNote] = useState<string>(initial?.note ?? "");

  const canSubmit =
    typeof weight === "number" && weight > 0 && prDate.length > 0 && !isPending;

  async function handleSubmit() {
    if (!canSubmit) return;
    await onSubmit({
      newWeight: weight as number,
      prDate,
      note: note.trim() === "" ? null : note.trim(),
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="pr-weight">무게 (kg)</Label>
          <Input
            id="pr-weight"
            type="number"
            value={weight === "" ? "" : weight}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              setWeight(Number.isNaN(v) ? "" : v);
            }}
            placeholder="예: 52"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pr-date">날짜</Label>
          <Input
            id="pr-date"
            type="date"
            value={prDate}
            max={todayISO()}
            onChange={(e) => setPrDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="pr-note">메모 (선택)</Label>
        <Textarea
          id="pr-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="예: clean만 성공, jerk 실패"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" /> 취소
          </Button>
        )}
        <Button size="sm" disabled={!canSubmit} onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-1" />
          {isPending ? "저장중..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
