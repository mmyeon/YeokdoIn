"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import RecordAddDialog from "@/components/PersonalRecords/RecordAddDialog";
import { Button } from "@/components/ui/button";
import { buildPersonalRecordRows } from "@/features/personal-records/model/build-record-rows";
import { groupExercisesByCategory } from "@/features/personal-records/model/group-exercises";
import { ROUTES } from "@/routes";
import { useExercises, usePersonalRecords } from "@/hooks/usePersonalRecords";
import { PersonalRecordInfo } from "@/types/personalRecords";

function formatShortDate(prDate: string | null): string {
  if (!prDate) return "";
  const d = new Date(prDate);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}

function PersonalRecordsPage() {
  const router = useRouter();
  const { data: records = [], isLoading: isLoadingRecords } =
    usePersonalRecords();
  const { data: exercises = [], isLoading: isLoadingExercises } =
    useExercises();

  const [addOpen, setAddOpen] = useState(false);
  const [presetExerciseId, setPresetExerciseId] = useState<number | undefined>();

  const isLoading = isLoadingRecords || isLoadingExercises;

  // PR 대상 종목 전체를 깔고 등록 여부를 표시한다 (FR-012). 12종목이라 평면 목록은
  // 길어지므로 종목 드롭다운과 같은 카테고리로 묶는다.
  const groups = groupExercisesByCategory(
    buildPersonalRecordRows(exercises, records)
  );

  const openAddDialog = (exerciseId?: number) => {
    setPresetExerciseId(exerciseId);
    setAddOpen(true);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.SETTINGS.ROOT);
    }
  };

  return (
    <main className="flex flex-col gap-4 max-w-md mx-auto pb-24 pt-2 px-0">
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로"
          className="-ml-1 flex items-center gap-1 rounded-md px-2 py-1.5 text-yd-text-muted text-[14px] font-medium hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-4" aria-hidden />
          설정
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 px-2 text-yd-primary font-semibold"
          onClick={() => openAddDialog()}
        >
          <Plus className="size-3.5" aria-hidden />
          추가
        </Button>
      </div>

      <header className="px-5">
        <h1 className="text-h1">PR</h1>
        <p className="mt-1 text-caption text-yd-text-muted">
          {records.length}개 기록 · 종목을 눌러 등록하세요
        </p>
      </header>

      <section className="flex flex-col gap-5 px-4">
        {isLoading ? (
          <div className="flex justify-center py-10 text-[13px] text-yd-text-muted">
            불러오는 중...
          </div>
        ) : groups.length === 0 ? (
          <EmptyState />
        ) : (
          groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <h2 className="px-1 text-caption font-semibold tracking-[0.04em] text-yd-text-muted">
                {group.label}
              </h2>
              <ul className="flex flex-col gap-1.5">
                {group.exercises.map((row) => (
                  <li key={row.id}>
                    {row.record ? (
                      <RecordRow record={row.record} />
                    ) : (
                      <UnrecordedRow
                        name={row.name}
                        onClick={() => openAddDialog(row.id)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <RecordAddDialog
        // 프리셋이 바뀌면 다이얼로그 내부 상태를 새로 만든다.
        key={presetExerciseId ?? "none"}
        open={addOpen}
        onOpenChange={setAddOpen}
        initialExerciseId={presetExerciseId}
      />
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-yd-line px-4 py-10 text-center">
      <p className="text-[13px] text-yd-text-muted leading-[1.6]">
        등록할 수 있는 종목이 없습니다.
      </p>
      <Plus className="size-4 text-yd-text-muted" aria-hidden />
    </div>
  );
}

interface RecordRowProps {
  record: PersonalRecordInfo;
}

function RecordRow({ record }: RecordRowProps) {
  const dateLabel = formatShortDate(record.prDate);

  return (
    <Link
      href={ROUTES.SETTINGS.PERSONAL_RECORD_DETAIL(record.id)}
      className="flex h-[54px] items-center justify-between gap-3 rounded-md border border-yd-line px-3.5 transition-colors hover:bg-yd-elevated"
    >
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[14px] font-semibold truncate">
          {record.exerciseName}
        </span>
        <span className="text-[10px] text-yd-text-muted">{dateLabel}</span>
      </div>

      <div className="flex items-baseline gap-1 text-yd-text">
        <span className="text-[20px] font-bold">{record.weight}</span>
        <span className="text-[11px] text-yd-text-muted">kg</span>
        <ChevronRight
          className="ml-1.5 size-3.5 text-yd-text-muted"
          aria-hidden
        />
      </div>
    </Link>
  );
}

interface UnrecordedRowProps {
  name: string;
  onClick: () => void;
}

function UnrecordedRow({ name, onClick }: UnrecordedRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[54px] w-full items-center justify-between gap-3 rounded-md border border-dashed border-yd-line px-3.5 text-left transition-colors hover:bg-yd-elevated"
    >
      <span className="truncate text-[14px] font-medium text-yd-text-muted">
        {name}
      </span>
      <span className="flex items-center gap-1 text-[11px] text-yd-text-muted">
        기록 없음
        <Plus className="size-3.5 text-yd-primary" aria-hidden />
      </span>
    </button>
  );
}

export default PersonalRecordsPage;
