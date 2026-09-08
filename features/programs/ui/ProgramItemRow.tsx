'use client';

import { useRef, useState } from 'react';
import { Check, CornerLeftUp, Plus, Scissors, Trash2 } from 'lucide-react';
import { SuspectText } from '@/features/programs/ui/SuspectText';

interface ProgramItemRowProps {
  text: string;
  /** 첫 항목은 위와 합칠 수 없다. */
  canMergeUp: boolean;
  onChange: (text: string) => void;
  onDelete: () => void;
  onAddBelow: () => void;
  onMergeUp: () => void;
  /** 캐럿 위치에서 두 항목으로 나눈다. */
  onSplit: (at: number) => void;
}

/**
 * 불릿 한 행. 항목 텍스트를 재구성하지 않고 그대로 보여주고 고친다.
 * 한 항목의 편집은 다른 항목에 영향을 주지 않는다.
 */
export function ProgramItemRow({
  text,
  canMergeUp,
  onChange,
  onDelete,
  onAddBelow,
  onMergeUp,
  onSplit,
}: ProgramItemRowProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSplit = () => {
    const at = inputRef.current?.selectionStart;
    if (at === null || at === undefined) return;
    onSplit(at);
    setEditing(false);
  };

  return (
    <li className="flex flex-col gap-1.5 border-b border-yd-line/60 px-1 py-2 last:border-b-0">
      <div className="flex items-baseline gap-2">
        <span aria-hidden className="text-[10px] text-yd-primary">
          ▸
        </span>

        {editing ? (
          <input
            ref={inputRef}
            autoFocus
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setEditing(false);
              }
            }}
            aria-label="항목 텍스트"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-md border border-yd-primary bg-yd-elevated px-2 py-1 font-mono text-[13px] leading-[1.6] text-yd-text outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="min-w-0 flex-1 break-words text-left font-mono text-[13px] leading-[1.6] text-yd-text"
          >
            <SuspectText text={text} />
          </button>
        )}

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-label={editing ? '편집 마치기' : '편집'}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-yd-text-dim hover:bg-yd-elevated"
        >
          {editing ? <Check className="size-3.5" /> : <Plus className="size-3.5 rotate-45" />}
        </button>
      </div>

      {editing && (
        <div className="flex flex-wrap items-center gap-1 pl-4">
          <RowAction
            label="아래에 추가"
            icon={<Plus className="size-3" />}
            onClick={onAddBelow}
          />
          <RowAction
            label="나누기"
            icon={<Scissors className="size-3" />}
            onClick={handleSplit}
          />
          {canMergeUp && (
            <RowAction
              label="위와 합치기"
              icon={<CornerLeftUp className="size-3" />}
              onClick={onMergeUp}
            />
          )}
          <RowAction
            label="삭제"
            icon={<Trash2 className="size-3" />}
            onClick={onDelete}
            destructive
          />
        </div>
      )}

      {editing && <SuspectPreview text={text} />}
    </li>
  );
}

interface RowActionProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

function RowAction({ label, icon, onClick, destructive }: RowActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex items-center gap-1 rounded-md border border-yd-line px-2 py-1 text-[11px] font-medium ' +
        (destructive ? 'text-yd-error' : 'text-yd-text-muted')
      }
    >
      {icon}
      {label}
    </button>
  );
}

/** 편집 중에도 의심 구간을 즉시 다시 계산해 보여준다. */
function SuspectPreview({ text }: { text: string }) {
  return (
    <p className="pl-4 font-mono text-[12px] leading-[1.6] text-yd-text-muted">
      <SuspectText text={text} />
    </p>
  );
}
