import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ghost-on-dark' | 'link';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-orange text-white hover:bg-orange-hover',
  secondary:
    'bg-white text-navy border-[1.5px] border-grey-light hover:border-orange',
  ghost:
    'bg-transparent text-navy hover:bg-canvas',
  'ghost-on-dark':
    'bg-white/10 text-white hover:bg-white/20',
  link:
    'bg-transparent text-orange hover:underline px-0 py-0',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className, ...rest }: Props) {
  const isLink = variant === 'link';
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        !isLink && SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...rest}
    />
  );
}
