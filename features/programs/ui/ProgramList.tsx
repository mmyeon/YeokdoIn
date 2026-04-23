'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/routes';
import { useDeleteProgram, usePrograms } from '@/hooks/usePrograms';
import type { ProgramRow } from '@/features/programs/api/programs';
import { programSchema } from '@/features/notation/model/schemas';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function summarize(row: ProgramRow): string {
  const parseResult = programSchema.safeParse(row.parsed_data);
  const parsed = parseResult.success ? parseResult.data : null;
  if (!parsed) return row.raw_notation;
  const blockCount = parsed.blocks.length;
  const first = parsed.blocks[0];
  const firstName = first?.movements?.[0]?.name ?? '';
  const suffix = blockCount > 1 ? ` 외 ${blockCount - 1}개 블록` : '';
  return firstName ? `${firstName}${suffix}` : row.raw_notation;
}

export function ProgramList() {
  const { data: programs = [], isLoading } = usePrograms();
  const { mutate: remove } = useDeleteProgram({
    onSuccess: () => toast.success('프로그램이 삭제되었습니다.'),
    onError: (e) => toast.error(e.message ?? '삭제에 실패했습니다.'),
  });

  if (isLoading) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        프로그램을 불러오는 중입니다...
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        저장된 프로그램이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {programs.map((row) => (
        <Card key={row.id} className="border-l-4 border-l-blue-500">
          <CardContent className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {formatDate(row.created_at)}
              </p>
              <p className="font-medium truncate">{summarize(row)}</p>
              <p className="text-xs text-muted-foreground truncate">
                {row.raw_notation}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                asChild
                variant="secondary"
                size="sm"
                aria-label="프로그램 실행"
              >
                <Link href={ROUTES.TRAINING.PROGRAM_RUNNER(row.id)}>
                  <Play className="h-4 w-4 mr-1" />
                  실행
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => {
                  if (confirm('이 프로그램을 삭제하시겠습니까?')) {
                    remove(row.id);
                  }
                }}
                aria-label="프로그램 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
