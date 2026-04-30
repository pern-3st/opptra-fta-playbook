import { cn } from '@/lib/cn';

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-3.5 py-2.5 border-[1.5px] border-grey-light rounded-lg text-sm text-navy bg-white focus:outline-none focus:border-orange transition-colors',
        className,
      )}
      {...rest}
    />
  );
}
