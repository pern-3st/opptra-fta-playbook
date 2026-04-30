import { cn } from '@/lib/cn';

interface Props {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, className, children }: Props) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-xs font-semibold uppercase tracking-wider text-grey mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-grey mt-1">{hint}</span>}
    </label>
  );
}
