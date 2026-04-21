'use client';

import { useEffect, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { parseNotation } from '@/features/notation/model/parser';
import { NotationParseError } from '@/features/notation/model/errors';
import type { Program } from '@/features/notation/model/types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface NotationTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onParsed: (program: Program | null, error: string | null) => void;
}

export function NotationTextarea({
  value,
  onChange,
  onParsed,
}: NotationTextareaProps) {
  const debounced = useDebouncedValue(value, 200);

  const { program, error } = useMemo(() => {
    const trimmed = debounced.trim();
    if (!trimmed) {
      return { program: null, error: null as string | null };
    }
    try {
      return { program: parseNotation(trimmed), error: null as string | null };
    } catch (e: unknown) {
      const message =
        e instanceof NotationParseError
          ? e.message
          : e instanceof Error
            ? e.message
            : '알 수 없는 파싱 오류';
      return { program: null, error: message };
    }
  }, [debounced]);

  useEffect(() => {
    onParsed(program, error);
  }, [program, error, onParsed]);

  return (
    <div className="space-y-2">
      <Label htmlFor="program-notation" className="text-sm font-medium">
        노테이션
      </Label>
      <Textarea
        id="program-notation"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'예) back squat 70% 5x3, snatch pull & power snatch 60% (3+1)x3'}
        aria-invalid={error ? true : undefined}
        className="font-mono text-sm"
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
