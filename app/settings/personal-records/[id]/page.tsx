"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Pill } from "@/components/ui/pill";
import PRHistoryEntryEditor from "@/components/PersonalRecords/PRHistoryEntryEditor";
import PRSparkline from "@/components/PersonalRecords/PRSparkline";
import { ROUTES } from "@/routes";
import {
  useAddPRHistoryEntry,
  useDeletePRHistoryEntry,
  usePRHistory,
  usePersonalRecords,
  useUpdatePRHistoryEntry,
} from "@/hooks/usePersonalRecords";
import { PRHistoryEntry } from "@/types/personalRecords";

function parseRecordId(raw: string | string[] | undefined): number | null {
  if (typeof raw !== "string") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function formatHistoryDate(prDate: string): string {
  const d = new Date(prDate);
  if (Number.isNaN(d.getTime())) return prDate;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function PRDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const recordId = parseRecordId(params?.id);

  if (recordId === null) notFound();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.SETTINGS.PERSONAL_RECORD);
    }
  };

  const { data: records = [], isLoading: isLoadingRecord } =
    usePersonalRecords();
  const record = records.find((r) => r.id === recordId);
  const exerciseId = record?.exerciseId ?? null;

  const { data: history = [], isLoading: isLoadingHistory } =
    usePRHistory(exerciseId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetMode = () => {
    setIsAdding(false);
    setEditingId(null);
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

  if (!isLoadingRecord && !record) {
    return (
      <main className="flex flex-col gap-4 max-w-md mx-auto pb-24 pt-2 px-0">
        <div className="px-4 pt-2 pb-1">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="-ml-1 flex items-center gap-1 rounded-md px-2 py-1.5 text-yd-text-muted text-[14px] font-medium hover:bg-yd-elevated"
          >
            <ChevronLeft className="size-4" aria-hidden />
            PR
          </button>
        </div>
        <div className="px-5 py-10 text-center text-[13px] text-yd-text-muted">
          기록을 찾을 수 없습니다.
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 max-w-md mx-auto pb-24 pt-2 px-0">
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로가기"
          className="-ml-1 flex items-center gap-1 rounded-md px-2 py-1.5 text-yd-text-muted text-[14px] font-medium hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-4" aria-hidden />
          PR
        </button>
        {!isAdding && exerciseId !== null && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-2 py-1 text-yd-primary text-[14px] font-semibold"
          >
            <Plus className="size-3.5" aria-hidden />
            추가
          </button>
        )}
      </div>

      <header className="px-5">
        <h1 className="text-[26px] font-bold">{record?.exerciseName}</h1>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[48px] font-extrabold leading-none tracking-[-1.5px]">
            {record?.weight ?? 0}
          </span>
          <span className="text-[16px] font-semibold text-yd-text-muted">
            kg
          </span>
          <span className="ml-2">
            <Pill size="sm" tone="primary" variant="outlined">
              현재
            </Pill>
          </span>
        </div>
      </header>

      <section className="px-4">
        <PRSparkline history={history} />
      </section>

      {isAdding && exerciseId !== null && (
        <section className="px-4">
          <div className="rounded-md border border-yd-line p-3">
            <PRHistoryEntryEditor
              submitLabel="추가"
              isPending={addMutation.isPending}
              onSubmit={(draft) => {
                addMutation.mutate({
                  exerciseId,
                  newWeight: draft.newWeight,
                  prDate: draft.prDate,
                  note: draft.note,
                });
              }}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        </section>
      )}

      <section className="px-5 pt-1">
        <h2 className="text-caption uppercase tracking-[0.08em] text-yd-text-muted">
          기록
        </h2>
      </section>

      <section className="px-4">
        {isLoadingHistory ? (
          <div className="flex justify-center py-10 text-[13px] text-yd-text-muted">
            불러오는 중...
          </div>
        ) : history.length === 0 ? (
          <div className="flex justify-center rounded-md border border-dashed border-yd-line px-4 py-8 text-[13px] text-yd-text-muted">
            아직 기록이 없습니다.
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {history.map((entry, i) => {
              const prev = history[i + 1];
              const isEditing = editingId === entry.id;
              return (
                <li key={entry.id}>
                  {isEditing ? (
                    <div className="rounded-md border border-yd-line p-3">
                      <PRHistoryEntryEditor
                        initial={{
                          newWeight: entry.newWeight,
                          prDate: entry.prDate,
                          note: entry.note,
                        }}
                        submitLabel="수정"
                        isPending={updateMutation.isPending}
                        onSubmit={(draft) => {
                          updateMutation.mutate({
                            id: entry.id,
                            patch: {
                              newWeight: draft.newWeight,
                              prDate: draft.prDate,
                              note: draft.note,
                            },
                          });
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <HistoryRow
                      entry={entry}
                      prevWeight={prev?.newWeight ?? null}
                      onEdit={() => setEditingId(entry.id)}
                      onDelete={() => {
                        if (!window.confirm("이 기록을 삭제할까요?")) return;
                        deleteMutation.mutate(entry.id);
                      }}
                      isDeleting={deleteMutation.isPending}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

interface HistoryRowProps {
  entry: PRHistoryEntry;
  prevWeight: number | null;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function HistoryRow({
  entry,
  prevWeight,
  onEdit,
  onDelete,
  isDeleting,
}: HistoryRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const delta = prevWeight !== null ? entry.newWeight - prevWeight : null;
  const deltaLabel =
    delta === null
      ? null
      : `${delta > 0 ? "+" : ""}${delta === 0 ? "±0" : delta}`;

  const fromLabel = prevWeight ?? entry.newWeight;

  return (
    <div
      className={`flex flex-col gap-1 rounded-md border border-yd-line px-3 py-2 ${
        entry.note ? "min-h-[56px]" : "min-h-[40px]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <span className="text-[11px] text-yd-text-muted">
            {formatHistoryDate(entry.prDate)}
          </span>
          <span className="text-[13px] font-semibold">
            {fromLabel} → {entry.newWeight} kg
          </span>
          {deltaLabel && (
            <span className="text-[11px] font-semibold text-yd-primary">
              ({deltaLabel})
            </span>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="기록 메뉴"
            className="flex size-6 items-center justify-center rounded-full text-yd-text-muted hover:bg-yd-elevated"
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 flex min-w-[96px] flex-col rounded-md border border-yd-line bg-yd-surface shadow-sm">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-yd-elevated"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              >
                <Pencil className="size-3.5" aria-hidden />
                수정
              </button>
              <button
                type="button"
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 py-2 text-left text-[13px] text-yd-error hover:bg-yd-elevated disabled:opacity-50"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                <Trash2 className="size-3.5" aria-hidden />
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
      {entry.note && (
        <p className="text-[10px] italic text-yd-text-muted">
          {`"${entry.note}"`}
        </p>
      )}
    </div>
  );
}

export default PRDetailPage;
