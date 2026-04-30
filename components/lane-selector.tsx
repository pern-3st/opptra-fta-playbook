'use client';
import { useMemo } from 'react';
import type { Country, Lane } from '@/lib/types';
import { Card, StepHeader } from './ui/card';
import { Select } from './ui/select';

interface Props {
  countries: Country[];
  lanes: Lane[];
  origin: string | null;
  destination: string | null;
  freeZone: boolean;
  onChange: (next: { origin?: string | null; destination?: string | null; freeZone?: boolean }) => void;
}

export function LaneSelector({ countries, lanes, origin, destination, freeZone, onChange }: Props) {
  const originOptions = useMemo(
    () => countries.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [countries],
  );
  const destOptions = useMemo(() => {
    if (!origin) return [];
    const ids = new Set(lanes.filter(l => l.originId === origin).map(l => l.destinationId));
    return countries.filter(c => ids.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [origin, lanes, countries]);

  return (
    <Card>
      <StepHeader num={1} title="Select Trade Lane" subtitle="Choose origin and destination to identify the applicable FTA" />
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-grey mb-1.5">Origin</label>
          <Select value={origin ?? ''} onChange={e => onChange({ origin: e.target.value || null, destination: null })}>
            <option value="">— Select origin —</option>
            {originOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div className="hidden md:block text-orange text-2xl font-bold pb-2">→</div>
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-grey mb-1.5">Destination</label>
          <Select value={destination ?? ''} disabled={!origin} onChange={e => onChange({ destination: e.target.value || null })}>
            <option value="">{origin ? '— Select destination —' : '— Select origin first —'}</option>
            {destOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
      </div>
      <label className="flex items-center gap-2 mt-4 text-sm">
        <input type="checkbox" checked={freeZone} onChange={e => onChange({ freeZone: e.target.checked })} />
        <span>This shipment involves a Free Zone / SEZ</span>
      </label>
    </Card>
  );
}
