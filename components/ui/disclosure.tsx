'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDownIcon } from './icon';

interface Props {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
  defaultOpen?: boolean;
  /**
   * When this value transitions from falsy to truthy, the section auto-collapses.
   * User-driven toggles are always preserved — this only fires on the transition.
   */
  collapseOn?: unknown;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Disclosure({
  title,
  subtitle,
  aside,
  defaultOpen = true,
  collapseOn,
  children,
  className,
  bodyClassName,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const prev = useRef(collapseOn);
  useEffect(() => {
    if (collapseOn && !prev.current) setOpen(false);
    prev.current = collapseOn;
  }, [collapseOn]);

  const reactId = useId();
  const bodyId = `${reactId}-body`;

  return (
    <section className={className}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="group w-full flex items-start gap-2.5 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-2"
      >
        <ChevronDownIcon
          size={20}
          className={cn(
            'mt-1.5 text-grey group-hover:text-navy transition-transform duration-300 ease-out',
            open ? 'rotate-0' : '-rotate-90',
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-navy">{title}</h2>
            {aside}
          </div>
          {subtitle && <p className="text-sm text-grey mt-0.5">{subtitle}</p>}
        </div>
      </button>
      <div
        id={bodyId}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className={cn('mt-4', bodyClassName)}>{children}</div>
        </div>
      </div>
    </section>
  );
}
