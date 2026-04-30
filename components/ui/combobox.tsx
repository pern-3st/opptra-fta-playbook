'use client';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDownIcon } from './icon';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxGroup {
  label: string;
  options: ComboboxOption[];
}

interface Props {
  groups: ComboboxGroup[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function Combobox({
  groups,
  value,
  onChange,
  placeholder = 'Select…',
  disabled,
  disabledPlaceholder,
  emptyMessage = 'No matches',
  className,
  id: idProp,
  'aria-label': ariaLabel,
}: Props) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const listboxId = `${id}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    for (const g of groups) {
      for (const o of g.options) if (o.value === value) return o;
    }
    return null;
  }, [groups, value]);

  const { flat, filteredGroups } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const flat: ComboboxOption[] = [];
    const filteredGroups: ComboboxGroup[] = [];
    for (const g of groups) {
      const groupMatch = q.length > 0 && g.label.toLowerCase().includes(q);
      const opts = g.options.filter(
        o => q.length === 0 || groupMatch || o.label.toLowerCase().includes(q),
      );
      if (opts.length) {
        filteredGroups.push({ label: g.label, options: opts });
        flat.push(...opts);
      }
    }
    return { flat, filteredGroups };
  }, [groups, query]);

  useEffect(() => {
    if (!open) return;
    if (flat.length === 0) {
      setActiveIndex(-1);
      return;
    }
    if (query.trim().length === 0 && selectedOption) {
      const i = flat.findIndex(o => o.value === selectedOption.value);
      setActiveIndex(i >= 0 ? i : 0);
    } else {
      setActiveIndex(0);
    }
  }, [open, flat, query, selectedOption]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) closeMenu();
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listboxRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeIndex]);

  function openMenu() {
    if (disabled) return;
    setOpen(true);
  }
  function closeMenu() {
    setOpen(false);
    setQuery('');
  }
  function commit(option: ComboboxOption) {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { openMenu(); return; }
      if (flat.length) setActiveIndex(i => (i + 1) % flat.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { openMenu(); return; }
      if (flat.length) setActiveIndex(i => (i <= 0 ? flat.length - 1 : i - 1));
    } else if (e.key === 'Home' && open) {
      e.preventDefault();
      if (flat.length) setActiveIndex(0);
    } else if (e.key === 'End' && open) {
      e.preventDefault();
      if (flat.length) setActiveIndex(flat.length - 1);
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && activeIndex < flat.length) {
        e.preventDefault();
        commit(flat[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        closeMenu();
      }
    } else if (e.key === 'Tab') {
      if (open) closeMenu();
    } else if (e.key === 'Backspace' && !open && selectedOption) {
      e.preventDefault();
      onChange(null);
    }
  }

  const displayValue = open ? query : (selectedOption?.label ?? '');
  const inputPlaceholder = disabled && disabledPlaceholder
    ? disabledPlaceholder
    : (open && selectedOption ? selectedOption.label : placeholder);

  let runningIdx = 0;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined
        }
        disabled={disabled}
        placeholder={inputPlaceholder}
        value={displayValue}
        onFocus={openMenu}
        onClick={openMenu}
        onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
        onKeyDown={onKeyDown}
        className={cn(
          'w-full px-3.5 py-2.5 pr-9 border-[1.5px] border-grey-light rounded-lg text-sm text-navy bg-white transition-colors',
          'focus:outline-none focus:border-orange focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'placeholder:text-grey',
        )}
      />
      <ChevronDownIcon
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-grey"
      />

      {open && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-20 max-h-72 overflow-y-auto rounded-lg border-[1.5px] border-grey-light bg-white shadow-lg"
        >
          {filteredGroups.length === 0 && (
            <div className="px-3.5 py-2.5 text-sm text-grey">{emptyMessage}</div>
          )}
          {filteredGroups.map(group => {
            const groupId = `${id}-grp-${group.label.replace(/\W+/g, '-')}`;
            return (
              <div key={group.label} role="group" aria-labelledby={groupId}>
                <div
                  id={groupId}
                  className="sticky top-0 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-grey bg-canvas border-b border-grey-light/60"
                >
                  {group.label}
                </div>
                {group.options.map(opt => {
                  const idx = runningIdx++;
                  const isActive = idx === activeIndex;
                  const isSelected = opt.value === value;
                  return (
                    <div
                      key={opt.value}
                      id={`${id}-opt-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      data-idx={idx}
                      onMouseDown={e => { e.preventDefault(); commit(opt); }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'px-3.5 py-2 text-sm cursor-pointer text-navy',
                        isActive && 'bg-canvas',
                        isSelected && 'font-semibold',
                      )}
                    >
                      {opt.label}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
