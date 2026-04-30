import { cn } from '@/lib/cn';

export function Notice({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl bg-yellow border border-orange/30 p-4 text-sm text-navy',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
