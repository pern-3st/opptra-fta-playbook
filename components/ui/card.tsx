import { cn } from '@/lib/cn';

export function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-black/5 shadow-sm p-7 mb-5',
        className,
      )}
      {...rest}
    />
  );
}

export function StepHeader({ num, title, subtitle }: { num: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-full bg-navy text-white grid place-items-center font-semibold text-sm">{num}</div>
      <div>
        <h2 className="text-xl font-bold text-navy">{title}</h2>
        {subtitle && <p className="text-sm text-grey mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
