'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/routes';
import { cn } from '@/lib/utils';
import { useDeleteProgram, usePrograms } from '@/hooks/usePrograms';
import {
  isToday,
  matchesFilter,
  matchesQuery,
  toLibraryItem,
  type LibraryFilter,
  type LibraryItem,
} from '@/features/programs/model/library';
import { TodayCard } from '@/features/programs/ui/TodayCard';
import { ProgramCard } from '@/features/programs/ui/ProgramCard';

interface FilterSpec {
  key: LibraryFilter;
  label: string;
}

const FILTERS: FilterSpec[] = [
  { key: 'all', label: '전체' },
  { key: 'week', label: '이번 주' },
  { key: 'snatch', label: '스내치' },
  { key: 'cj', label: 'C&J' },
  { key: 'squat', label: '스쿼트' },
];

export default function ProgramsLibraryPage() {
  const router = useRouter();
  const { data: rows = [], isLoading } = usePrograms();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LibraryFilter>('all');

  const { mutate: remove } = useDeleteProgram({
    onSuccess: () => toast.success('프로그램이 삭제되었습니다.'),
    onError: (e) => toast.error(e.message ?? '삭제에 실패했습니다.'),
  });

  const items: LibraryItem[] = useMemo(
    () => rows.map(toLibraryItem),
    [rows],
  );

  const todayItem = useMemo(() => {
    if (items.length === 0) return null;
    const [latest] = items;
    return latest && isToday(latest.createdAt) ? latest : null;
  }, [items]);

  const rest = useMemo(
    () => (todayItem ? items.filter((i) => i.id !== todayItem.id) : items),
    [items, todayItem],
  );

  const counts = useMemo(() => {
    const byFilter: Record<LibraryFilter, number> = {
      all: items.length,
      week: 0,
      snatch: 0,
      cj: 0,
      squat: 0,
    };
    for (const item of rest) {
      for (const f of FILTERS) {
        if (f.key !== 'all' && matchesFilter(item, f.key)) byFilter[f.key] += 1;
      }
    }
    return byFilter;
  }, [rest, items.length]);

  const filtered = useMemo(
    () =>
      rest.filter(
        (i) => matchesFilter(i, filter) && matchesQuery(i, query),
      ),
    [rest, filter, query],
  );

  const showTodayCard = todayItem && filter === 'all' && !query;

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/training');
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-yd-bg pb-20 text-yd-text">
      <header className="flex items-center gap-3 px-4 pb-1 pt-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로가기"
          className="-ml-1 flex size-8 items-center justify-center rounded-md text-yd-text-muted hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-5" />
        </button>
      </header>

      <section className="flex items-center justify-between px-4 pb-2.5 pt-1">
        <div>
          <h1 className="text-[24px] font-bold -tracking-[0.6px]">프로그램</h1>
          <p className="mt-0.5 text-[12px] text-yd-text-muted">
            {items.length}개의 프로그램
          </p>
        </div>
        <Link
          href={ROUTES.TRAINING.PROGRAM_INPUT}
          className="flex h-[38px] items-center gap-1.5 rounded-[10px] bg-yd-primary px-3.5 text-[13px] font-bold text-yd-on-primary shadow-[0_4px_14px_var(--yd-primary-soft)]"
        >
          <Plus className="size-4" /> 새로
        </Link>
      </section>

      <section className="px-4 pb-2.5">
        <div className="flex h-10 items-center gap-2 rounded-[10px] border border-yd-line bg-yd-surface px-3">
          <Search className="size-3.5 text-yd-text-dim" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름 · 동작으로 검색"
            aria-label="프로그램 검색"
            className="flex-1 bg-transparent text-[13px] text-yd-text outline-none placeholder:text-yd-text-dim"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="검색어 지우기"
              className="text-yd-text-dim"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </section>

      <section
        className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="필터"
      >
        {FILTERS.map(({ key, label }) => {
          const on = filter === key;
          const count = key === 'all' ? items.length : counts[key];
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setFilter(key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] transition-colors',
                on
                  ? 'border-yd-primary bg-yd-primary font-semibold text-yd-on-primary'
                  : 'border-yd-line bg-transparent font-medium text-yd-text-muted',
              )}
            >
              {label}
              <span
                className={cn(
                  'font-mono text-[10px]',
                  on ? 'opacity-75' : 'opacity-60',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </section>

      <section className="flex flex-1 flex-col gap-1.5 px-4 pb-5">
        {isLoading ? (
          <p className="py-10 text-center text-[13px] text-yd-text-muted">
            프로그램을 불러오는 중입니다...
          </p>
        ) : (
          <>
            {showTodayCard && <TodayCard item={todayItem} />}

            {filter === 'all' && !query && rest.length > 0 && (
              <div className="flex items-baseline justify-between pb-1 pt-3">
                <span className="text-[11px] uppercase tracking-[1.2px] text-yd-text-muted">
                  라이브러리
                </span>
                <span className="text-[11px] text-yd-text-muted">
                  {rest.length}개
                </span>
              </div>
            )}

            {items.length === 0 ? (
              <EmptyState
                icon="📋"
                title="저장된 프로그램이 없습니다"
                sub="첫 프로그램을 추가해 보세요"
                ctaHref={ROUTES.TRAINING.PROGRAM_INPUT}
                ctaLabel="프로그램 추가"
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="∅"
                title="일치하는 프로그램이 없습니다"
                sub="다른 필터나 검색어를 시도해보세요"
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                {filtered.map((item) => (
                  <ProgramCard
                    key={item.id}
                    item={item}
                    onDelete={() => remove(item.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  sub: string;
  ctaHref?: string;
  ctaLabel?: string;
}

function EmptyState({ icon, title, sub, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-yd-line px-5 py-12 text-center">
      <span className="text-[24px] text-yd-text-muted">{icon}</span>
      <p className="text-[13px] font-semibold text-yd-text">{title}</p>
      <p className="text-[12px] text-yd-text-muted">{sub}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-3 rounded-[10px] bg-yd-primary px-3.5 py-2 text-[13px] font-bold text-yd-on-primary"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
