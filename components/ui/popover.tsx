'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  align?: 'start' | 'end';
  triggerLabel?: string;
}

export function Popover({
  trigger,
  children,
  className,
  contentClassName,
  align = 'start',
  triggerLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label={triggerLabel}
        aria-expanded={open}
        onClick={e => {
          e.stopPropagation();
          setOpen(o => !o);
        }}
        className="inline-flex items-center justify-center rounded-full text-grey hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="dialog"
          onClick={e => e.stopPropagation()}
          className={cn(
            'absolute z-30 top-full mt-1.5 min-w-[14rem] max-w-xs rounded-lg border border-grey-light/70 bg-white shadow-lg p-3 text-sm text-navy text-left whitespace-normal',
            align === 'end' ? 'right-0' : 'left-0',
            contentClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
