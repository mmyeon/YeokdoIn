"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/input/label";
import { Textarea } from "@/components/ui/textarea";
import {
  validatePRInput,
  type ValidationError,
} from "@/features/personal-records/model/validate-pr-input";
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

/** 무게 입력 경계. 서버 액션과 DB CHECK 제약이 같은 값을 강제한다. */
const MIN_WEIGHT_KG = 1;
const MAX_WEIGHT_KG = 1000;

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function messageFor(
  errors: ValidationError[],
  field: ValidationError["field"]
): string | null {
  return errors.find((error) => error.field === field)?.message ?? null;
}

export default function PRHistoryEntryEditor({
  initial,
  submitLabel = "저장",
  isPending,
  onSubmit,
  onCancel,
}: PRHistoryEntryEditorProps) {
  const [weight, setWeight] = useState<number | "">(initial?.newWeight ?? "");
  const [prDate, setPrDate] = useState<string>(initial?.prDate ?? todayISO());
  const [note, setNote] = useState<string>(initial?.note ?? "");
  // 아직 건드리지 않은 필드에 "무게를 입력해주세요"를 띄우지 않기 위한 상태.
  const [touched, setTouched] = useState<Record<ValidationError["field"], boolean>>({
    weight: false,
    prDate: false,
  });

  // UI와 서버 액션이 같은 순수 함수를 부르므로 규칙이 갈라지지 않는다.
  const errors = validatePRInput(
    { weight: weight === "" ? null : weight, prDate },
    todayISO()
  );
  const weightError = touched.weight ? messageFor(errors, "weight") : null;
  const prDateError = touched.prDate ? messageFor(errors, "prDate") : null;

  const canSubmit = errors.length === 0 && !isPending;

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
            step={1}
            min={MIN_WEIGHT_KG}
            max={MAX_WEIGHT_KG}
            value={weight === "" ? "" : weight}
            aria-invalid={weightError !== null}
            aria-describedby={weightError ? "pr-weight-error" : undefined}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              setWeight(Number.isNaN(v) ? "" : v);
              setTouched((prev) => ({ ...prev, weight: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, weight: true }))}
            placeholder="예: 52"
          />
          {weightError && (
            <p id="pr-weight-error" className="text-xs text-destructive">
              {weightError}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="pr-date">날짜</Label>
          <Input
            id="pr-date"
            type="date"
            value={prDate}
            max={todayISO()}
            aria-invalid={prDateError !== null}
            aria-describedby={prDateError ? "pr-date-error" : undefined}
            onChange={(e) => {
              setPrDate(e.target.value);
              setTouched((prev) => ({ ...prev, prDate: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, prDate: true }))}
          />
          {prDateError && (
            <p id="pr-date-error" className="text-xs text-destructive">
              {prDateError}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="pr-note">메모 (선택)</Label>
        <Textarea
          id="pr-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="예: 클린만 성공, 저크 실패"
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
          {isPending ? "저장 중..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
