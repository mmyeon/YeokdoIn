'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import BackButton from '@/components/BackButton';
import { ProgramForm } from '@/features/programs/ui/ProgramForm';
import { ProgramList } from '@/features/programs/ui/ProgramList';
import { useSaveProgram } from '@/hooks/usePrograms';
import { ROUTES } from '@/routes';
import type { Program } from '@/features/notation/model/types';
import { createEmptyBlock } from '@/features/programs/model/update';
import { serializeProgram } from '@/features/programs/model/serialize';
import { programSchema } from '@/features/notation/model/schemas';

function createInitialProgram(): Program {
  return { blocks: [createEmptyBlock()] };
}

export default function ProgramInputPage() {
  const router = useRouter();
  const [program, setProgram] = useState<Program>(createInitialProgram);

  const { mutate: save, isPending } = useSaveProgram({
    onSuccess: (row) => {
      toast.success('프로그램이 저장되었습니다.');
      router.push(ROUTES.TRAINING.PROGRAM_RUNNER(row.id));
    },
    onError: (e) => toast.error(e.message ?? '저장에 실패했습니다.'),
  });

  const validation = programSchema.safeParse(program);
  const canSave = !isPending && validation.success;

  const handleSave = () => {
    if (!validation.success) return;
    save({
      rawNotation: serializeProgram(program),
      parsed: program,
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
            블록별로 동작, %, reps, sets 를 입력하세요.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <ProgramForm program={program} onChange={setProgram} />

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
