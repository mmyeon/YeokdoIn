"use client";

import { useRef, useState } from "react";
import { Check, CornerLeftUp, Plus, Scissors, Trash2 } from "lucide-react";
import { SuspectText } from "@/features/programs/ui/SuspectText";
import {
  fromEditBuffer,
  splitForDisplay,
  toEditBuffer,
} from "@/features/programs/model/display-layout";

interface ProgramItemRowProps {
  text: string;
  /** 첫 항목은 위와 합칠 수 없다. */
  canMergeUp: boolean;
  onChange: (text: string) => void;
  onDelete: () => void;
  onAddBelow: () => void;
  onMergeUp: () => void;
  /** 캐럿 위치에서 두 항목으로 나눈다. 캐럿 뒤 전체가 새 항목이 된다. */
  onSplit: (at: number) => void;
}

/**
 * 불릿 한 행. 항목 텍스트를 그대로 보여주고 고친다.
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
  /** 편집 중 화면에 보이는 텍스트. 최상위 쉼표가 줄바꿈으로 바뀐 형태다. */
  const [buffer, setBuffer] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  /**
   * 마지막으로 본 캐럿 위치.
   * 「나누기」 버튼을 누르면 textarea 가 먼저 포커스를 잃어 그 시점의
   * selectionStart 를 믿을 수 없다. 선택이 바뀔 때마다 기억해 둔다.
   */
  const caretRef = useRef<number>(0);

  const rememberCaret = () => {
    const at = inputRef.current?.selectionStart;
    if (typeof at === "number") caretRef.current = at;
  };

  const startEditing = () => {
    setBuffer(toEditBuffer(text));
    caretRef.current = 0;
    setEditing(true);
  };

  const handleSplit = () => {
    onSplit(caretRef.current);
    setEditing(false);
  };

  return (
    <li className="flex flex-col gap-1.5 border-b border-yd-line/60 px-1 py-2 last:border-b-0">
      <div className="flex items-baseline gap-2">
        <span aria-hidden className="text-[10px] text-yd-primary">
          ▸
        </span>

        {editing ? (
          <textarea
            ref={inputRef}
            autoFocus
            rows={buffer.split("\n").length}
            value={buffer}
            onChange={(e) => {
              setBuffer(e.target.value);
              onChange(fromEditBuffer(e.target.value));
              rememberCaret();
            }}
            onSelect={rememberCaret}
            onKeyUp={rememberCaret}
            onClick={rememberCaret}
            onKeyDown={(e) => {
              // Enter 는 줄바꿈(= 쉼표) 삽입이다. 편집 종료는 ✓ 버튼이다.
              if (e.key === "Escape") {
                e.preventDefault();
                setEditing(false);
              }
            }}
            aria-label="항목 텍스트"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            className="min-w-0 flex-1 resize-none break-words rounded-md border border-yd-primary bg-yd-elevated px-2 py-1 font-mono text-[13px] leading-[1.6] text-yd-text outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="min-w-0 flex-1 break-words text-left font-mono text-[13px] leading-[1.6] text-yd-text"
          >
            <ItemText text={text} />
          </button>
        )}

        <button
          type="button"
          onClick={() => (editing ? setEditing(false) : startEditing())}
          aria-label={editing ? "편집 마치기" : "편집"}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-yd-text-dim hover:bg-yd-elevated"
        >
          {editing ? (
            <Check className="size-3.5" />
          ) : (
            <Plus className="size-3.5 rotate-45" />
          )}
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
            label="커서에서 나누기"
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
    </li>
  );
}

/**
 * 강도가 둘 이상이면 종목명 한 줄 + 강도 조각 여러 줄로 그린다.
 * 문자는 그대로 두고 배치만 바꾼다.
 */
function ItemText({ text }: { text: string }) {
  const layout = splitForDisplay(text);
  if (!layout) return <SuspectText text={text} />;

  return (
    <span className="flex flex-col gap-0.5">
      {layout.head && (
        <span className="text-yd-text">
          <SuspectText text={layout.head} />
        </span>
      )}
      {layout.pieces.map((piece, i) => (
        <span key={i} className="pl-3 text-yd-text-muted">
          <SuspectText text={piece} />
        </span>
      ))}
    </span>
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
        "flex items-center gap-1 rounded-md border border-yd-line px-2 py-1 text-[11px] font-medium " +
        (destructive ? "text-yd-error" : "text-yd-text-muted")
      }
    >
      {icon}
      {label}
    </button>
  );
}
