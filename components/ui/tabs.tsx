'use client';
import { cn } from '@/lib/cn';

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 border-b border-grey-light mb-4">
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            value === t.id ? 'border-orange text-navy' : 'border-transparent text-grey hover:text-navy',
          )}
        >{t.label}</button>
      ))}
    </div>
  );
}
