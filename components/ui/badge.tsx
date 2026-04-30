import { cn } from '@/lib/cn';

type Tone = 'navy' | 'orange' | 'grey';

const TONES: Record<Tone, string> = {
  navy: 'bg-navy/10 text-navy',
  orange: 'bg-orange/10 text-orange',
  grey: 'bg-grey/10 text-grey',
};

export function Badge({ tone = 'grey', className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', TONES[tone], className)}>
      {children}
    </span>
  );
}
