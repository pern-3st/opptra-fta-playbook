import { cn } from '@/lib/cn';

type Tone = 'navy' | 'orange' | 'grey';
type Variant = 'solid' | 'outline';

const SOLID: Record<Tone, string> = {
  navy: 'bg-navy/10 text-navy',
  orange: 'bg-orange/10 text-orange',
  grey: 'bg-grey/10 text-grey',
};

const OUTLINE: Record<Tone, string> = {
  navy: 'border border-navy/25 text-navy',
  orange: 'border border-orange/40 text-orange',
  grey: 'border border-grey-light text-grey',
};

interface Props {
  tone?: Tone;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = 'grey', variant = 'solid', className, children }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        (variant === 'outline' ? OUTLINE : SOLID)[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
