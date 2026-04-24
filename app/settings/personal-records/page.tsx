"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Pill } from "@/components/ui/pill";
import RecordAddDialog from "@/components/PersonalRecords/RecordAddDialog";
import { ROUTES } from "@/routes";
import { usePersonalRecords } from "@/hooks/usePersonalRecords";
import { PersonalRecordInfo } from "@/types/personalRecords";

const RECENT_THRESHOLD_DAYS = 14;

function isRecent(prDate: string | null): boolean {
  if (!prDate) return false;
  const diffMs = Date.now() - new Date(prDate).getTime();
  return diffMs >= 0 && diffMs < RECENT_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

function formatShortDate(prDate: string | null): string {
  if (!prDate) return "";
  const d = new Date(prDate);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}

function PersonalRecordsPage() {
  const router = useRouter();
  const { data: records = [], isLoading } = usePersonalRecords();

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
          aria-label="뒤로가기"
          className="-ml-1 flex items-center gap-1 rounded-md px-2 py-1.5 text-yd-text-muted text-[14px] font-medium hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-4" aria-hidden />
          설정
        </button>
        <RecordAddDialog />
      </div>

      <header className="px-5">
        <h1 className="text-h1">PR</h1>
        <p className="mt-1 text-caption text-yd-text-muted">최근순</p>
      </header>

      <section className="px-4">
        {isLoading ? (
          <div className="flex justify-center py-10 text-[13px] text-yd-text-muted">
            로딩 중...
          </div>
        ) : records.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {records.map((record) => (
              <li key={record.id}>
                <RecordRow record={record} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-yd-line px-4 py-10 text-center">
      <p className="text-[13px] text-yd-text-muted leading-[1.6]">
        저장된 개인 기록이 없습니다.
        <br />
        우측 상단 + 버튼으로 추가해 주세요.
      </p>
      <Plus className="size-4 text-yd-text-muted" aria-hidden />
    </div>
  );
}

interface RecordRowProps {
  record: PersonalRecordInfo;
}

function RecordRow({ record }: RecordRowProps) {
  const recent = isRecent(record.prDate);
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
        <span className="flex items-center gap-1.5 text-[10px] text-yd-text-muted">
          {dateLabel && <span>{dateLabel}</span>}
          {recent && (
            <Pill size="sm" tone="primary" variant="outlined">
              최근
            </Pill>
          )}
        </span>
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

export default PersonalRecordsPage;
