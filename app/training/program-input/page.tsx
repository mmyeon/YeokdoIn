'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label';
import BackButton from '@/components/BackButton';
import { NotationTextarea } from '@/features/programs/ui/NotationTextarea';
import { ProgramForm } from '@/features/programs/ui/ProgramForm';
import { ProgramList } from '@/features/programs/ui/ProgramList';
import { useSaveProgram } from '@/hooks/usePrograms';
import { ROUTES } from '@/routes';
import type { Program } from '@/features/notation/model/types';

// TODO(1C-4): /training/program-runner/[id] 라우트 페이지 구현 예정.
//   저장 직후 이 경로로 리다이렉트하므로, 현재는 404가 날 수 있다.

export default function ProgramInputPage() {
  const router = useRouter();
  const [rawNotation, setRawNotation] = useState('');
  const [title, setTitle] = useState('');
  const [program, setProgram] = useState<Program | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const { mutate: save, isPending } = useSaveProgram({
    onSuccess: (row) => {
      toast.success('프로그램이 저장되었습니다.');
      router.push(ROUTES.TRAINING.PROGRAM_RUNNER(row.id));
    },
    onError: (e) => toast.error(e.message ?? '저장에 실패했습니다.'),
  });

  const handleParsed = useCallback(
    (next: Program | null, error: string | null) => {
      setProgram(next);
      setParseError(error);
    },
    [],
  );

  const canSave =
    !isPending &&
    program !== null &&
    parseError === null &&
    rawNotation.trim().length > 0;

  const handleSave = () => {
    if (!program) return;
    save({
      rawNotation,
      parsed: program,
      title: title.trim() === '' ? null : title,
    });
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-md space-y-6">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-xl font-bold">프로그램 입력</h1>
      </div>

      <Card className="toss-card">
        <CardHeader className="pb-0">
          <h2 className="text-base font-semibold">새 프로그램</h2>
          <p className="text-xs text-muted-foreground">
            코치 표기를 붙여넣으면 자동으로 블록이 만들어집니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="program-title" className="text-sm font-medium">
              제목 (선택)
            </Label>
            <Input
              id="program-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 월요일 하체"
            />
          </div>

          <NotationTextarea
            value={rawNotation}
            onChange={setRawNotation}
            onParsed={handleParsed}
          />

          {program && !parseError && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                노테이션을 다시 수정하면 블록 편집 내용은 초기화됩니다.
              </p>
              <ProgramForm program={program} onChange={setProgram} />
            </div>
          )}

          <Button
            type="button"
            className="w-full h-12 rounded-xl text-base font-semibold"
            disabled={!canSave}
            onClick={handleSave}
          >
            {isPending ? '저장 중...' : '프로그램 저장'}
          </Button>
        </CardContent>
      </Card>

      <Card className="toss-card">
        <CardHeader className="pb-0">
          <h2 className="text-base font-semibold">내 프로그램</h2>
        </CardHeader>
        <CardContent className="pt-4">
          <ProgramList />
        </CardContent>
      </Card>
    </main>
  );
}
