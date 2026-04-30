import { cn } from '@/lib/cn';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  wrapperClassName?: string;
}

export function Checkbox({ label, wrapperClassName, className, ...rest }: Props) {
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm cursor-pointer select-none', wrapperClassName)}>
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 accent-orange',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1 rounded-sm',
          className,
        )}
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}
