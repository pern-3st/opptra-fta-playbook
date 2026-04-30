'use client';
import { cn } from '@/lib/cn';
import { SearchIcon, XIcon } from './icon';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange, className, placeholder, ...rest }: Props) {
  return (
    <div className={cn('relative', className)}>
      <SearchIcon
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-grey"
      />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'w-full pl-9 pr-9 py-2.5 border-[1.5px] border-grey-light rounded-lg text-sm text-navy bg-white transition-colors',
          'focus:outline-none focus:border-orange focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1',
          'placeholder:text-grey',
          '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
        )}
        {...rest}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-grey hover:text-navy rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  );
}
