import { cn } from '@/lib/cn';

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-3.5 py-2.5 border-[1.5px] border-grey-light rounded-lg text-sm text-navy bg-white transition-colors',
        'focus:outline-none focus:border-orange focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1',
        className,
      )}
      {...rest}
    />
  );
}
