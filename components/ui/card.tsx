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

interface StepHeaderProps {
  num?: number;
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
}

export function StepHeader({ num, title, subtitle, aside }: StepHeaderProps) {
  return (
    <div className="flex items-center flex-wrap gap-3 mb-5">
      {num !== undefined && (
        <div className="w-8 h-8 rounded-full bg-navy text-white grid place-items-center font-semibold text-sm shrink-0">
          {num}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-navy">{title}</h2>
        {subtitle && <p className="text-sm text-grey mt-0.5">{subtitle}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
