import { cn } from '@/lib/cn';

export function Button({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-orange text-white font-medium text-sm hover:bg-orange-hover transition-colors disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  );
}
