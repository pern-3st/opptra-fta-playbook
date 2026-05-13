import { cn } from '@/lib/cn';

type Tone = 'navy' | 'orange' | 'grey' | 'green' | 'blue' | 'amber';
type Variant = 'solid' | 'outline';

const SOLID: Record<Tone, string> = {
  navy: 'bg-navy/10 text-navy',
  orange: 'bg-orange/10 text-orange',
  grey: 'bg-grey/10 text-grey',
  green: 'bg-green/10 text-green',
  blue: 'bg-blue/10 text-blue',
  amber: 'bg-amber/10 text-amber',
};

const OUTLINE: Record<Tone, string> = {
  navy: 'border border-navy/25 text-navy',
  orange: 'border border-orange/40 text-orange',
  grey: 'border border-grey-light text-grey',
  green: 'border border-green/40 text-green',
  blue: 'border border-blue/40 text-blue',
  amber: 'border border-amber/40 text-amber',
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
