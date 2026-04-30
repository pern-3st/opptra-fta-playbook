import { cn } from '@/lib/cn';

export type IconProps = Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number;
};

function iconProps({ size = 16, className, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    'aria-hidden': true,
    className: cn('inline-block shrink-0', className),
    ...rest,
  };
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...iconProps(props)}>
      <path d="M5.5 7.5L10 12l4.5-4.5z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconProps(props)}
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M14 14l3 3" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...iconProps(props)}
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...iconProps(props)}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 112 0 1 1 0 01-2 0zm0 3.5A.75.75 0 019.75 9h.5a.75.75 0 01.75.75V14a.75.75 0 01-1.5 0V9.5z"
      />
    </svg>
  );
}

export function ArrowUpDownIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconProps(props)}
    >
      <path d="M7 4v12M7 4L4 7M7 4l3 3M13 16V4M13 16l-3-3M13 16l3-3" />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconProps(props)}
    >
      <path d="M10 16V4M6 8l4-4 4 4" />
    </svg>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconProps(props)}
    >
      <path d="M10 4v12M6 12l4 4 4-4" />
    </svg>
  );
}
