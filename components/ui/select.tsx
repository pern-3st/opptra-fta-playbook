import { cn } from '@/lib/cn';

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full appearance-none px-3.5 py-2.5 pr-9 border-[1.5px] border-grey-light rounded-lg text-sm text-navy bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:border-orange focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey"
        fill="currentColor"
      >
        <path d="M5.5 7.5L10 12l4.5-4.5z" />
      </svg>
    </div>
  );
}
