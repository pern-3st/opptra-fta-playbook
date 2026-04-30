'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export interface Selections {
  origin: string | null;
  destination: string | null;
  freeZone: boolean;
  hsn: string | null;
}

function readSelections(params: URLSearchParams): Selections {
  return {
    origin: params.get('origin'),
    destination: params.get('dest'),
    freeZone: params.get('fz') === '1',
    hsn: params.get('hsn'),
  };
}

export function useSelections() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selections = readSelections(params);

  const setSelections = useCallback((next: Partial<Selections>) => {
    const current = readSelections(new URLSearchParams(window.location.search));
    const merged = { ...current, ...next };
    const sp = new URLSearchParams();
    if (merged.origin) sp.set('origin', merged.origin);
    if (merged.destination) sp.set('dest', merged.destination);
    if (merged.freeZone) sp.set('fz', '1');
    if (merged.hsn) sp.set('hsn', merged.hsn);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router]);

  return { selections, setSelections };
}
