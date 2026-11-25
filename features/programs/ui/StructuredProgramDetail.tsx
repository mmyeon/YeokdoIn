'use client';

import { useState } from 'react';
import { StructuredProgramEdit } from '@/features/programs/ui/StructuredProgramEdit';
import { StructuredProgramView } from '@/features/programs/ui/StructuredProgramView';
import type { ProgramView } from '@/features/programs/model/parse-program-row';

type Structured = Extract<ProgramView, { kind: 'structured' }>;

export function StructuredProgramDetail({ view }: { view: Structured }) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return mode === 'edit' ? (
    <StructuredProgramEdit view={view} onDone={() => setMode('view')} />
  ) : (
    <StructuredProgramView view={view} onEdit={() => setMode('edit')} />
  );
}
