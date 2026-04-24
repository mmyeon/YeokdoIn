'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input/input';
import { MOVEMENT_GROUPS } from '@/features/programs/model/movements';

interface MovementComboboxProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
}

export function MovementCombobox({
  value,
  onChange,
  ariaLabel,
  placeholder = '동작 검색/선택',
}: MovementComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOVEMENT_GROUPS;
    return MOVEMENT_GROUPS.map((g) => ({
      category: g.category,
      items: g.items.filter((name) => name.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const flatItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups],
  );

  useEffect(() => {
    setHighlight((h) => {
      if (flatItems.length === 0) return 0;
      return Math.min(h, flatItems.length - 1);
    });
  }, [flatItems.length]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-index="${highlight}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  function commit(name: string) {
    onChange(name);
    setOpen(false);
    setEditing(false);
    setQuery('');
    setHighlight(0);
  }

  const displayValue = editing ? query : value;

  let runningIndex = -1;

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-autocomplete="list"
        role="combobox"
        value={displayValue}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setEditing(true);
          setQuery('');
          setHighlight(0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setEditing(true);
          setOpen(true);
          setHighlight(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }
            setHighlight((h) =>
              flatItems.length === 0 ? 0 : (h + 1) % flatItems.length,
            );
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }
            setHighlight((h) =>
              flatItems.length === 0
                ? 0
                : (h - 1 + flatItems.length) % flatItems.length,
            );
          } else if (e.key === 'Home') {
            if (open && flatItems.length > 0) {
              e.preventDefault();
              setHighlight(0);
            }
          } else if (e.key === 'End') {
            if (open && flatItems.length > 0) {
              e.preventDefault();
              setHighlight(flatItems.length - 1);
            }
          } else if (e.key === 'Enter') {
            if (open && flatItems[highlight]) {
              e.preventDefault();
              commit(flatItems[highlight]);
              (e.target as HTMLInputElement).blur();
            }
          } else if (e.key === 'Escape') {
            setOpen(false);
            setEditing(false);
            setQuery('');
            (e.target as HTMLInputElement).blur();
          } else if (e.key === 'Tab') {
            setOpen(false);
            setEditing(false);
            setQuery('');
          }
        }}
      />
      {open && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
          role="listbox"
        >
          {flatItems.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              일치하는 동작이 없어요
            </div>
          ) : (
            filteredGroups.map((g) => (
              <div key={g.category} className="py-1">
                <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                  {g.category}
                </div>
                {g.items.map((name) => {
                  runningIndex += 1;
                  const idx = runningIndex;
                  const active = name === value;
                  const highlighted = idx === highlight;
                  return (
                    <button
                      key={name}
                      type="button"
                      role="option"
                      aria-selected={active}
                      data-index={idx}
                      className={`w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                        highlighted ? 'bg-accent text-accent-foreground' : ''
                      } ${active && !highlighted ? 'bg-accent/50' : ''}`}
                      onMouseEnter={() => setHighlight(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        commit(name);
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
