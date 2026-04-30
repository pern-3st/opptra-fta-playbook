'use client';
import { useMemo } from 'react';
import type { Country } from '@/lib/types';
import { Card, StepHeader } from './ui/card';
import { Combobox, type ComboboxGroup } from './ui/combobox';
import { Field } from './ui/field';
import { Checkbox } from './ui/checkbox';

interface Props {
  countries: Country[];
  origin: string | null;
  destination: string | null;
  freeZone: boolean;
  onChange: (next: { origin?: string | null; destination?: string | null; freeZone?: boolean }) => void;
}

const UNGROUPED_LABEL = 'Other';

function groupByRegion(countries: Country[]): ComboboxGroup[] {
  const buckets = new Map<string, { regionSeq: number; countries: Country[] }>();
  for (const c of countries) {
    const label = c.region ?? UNGROUPED_LABEL;
    const seq = c.regionSeq ?? Number.POSITIVE_INFINITY;
    const bucket = buckets.get(label);
    if (bucket) {
      bucket.countries.push(c);
      if (seq < bucket.regionSeq) bucket.regionSeq = seq;
    } else {
      buckets.set(label, { regionSeq: seq, countries: [c] });
    }
  }
  return Array.from(buckets.entries())
    .sort((a, b) => a[1].regionSeq - b[1].regionSeq || a[0].localeCompare(b[0]))
    .map(([label, { countries }]) => ({
      label,
      options: countries
        .slice()
        .sort((a, b) => {
          const ai = a.countrySeq ?? Number.POSITIVE_INFINITY;
          const bi = b.countrySeq ?? Number.POSITIVE_INFINITY;
          return ai - bi || a.name.localeCompare(b.name);
        })
        .map(c => ({ value: c.id, label: c.name })),
    }));
}

export function LaneSelector({ countries, origin, destination, freeZone, onChange }: Props) {
  const originGroups = useMemo(() => groupByRegion(countries), [countries]);
  const destGroups = useMemo(
    () => (origin ? groupByRegion(countries.filter(c => c.id !== origin)) : []),
    [origin, countries],
  );

  return (
    <Card>
      <StepHeader num={1} title="Select Trade Lane" subtitle="Choose origin and destination to identify the applicable FTA" />
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <Field label="Origin" className="flex-1">
          <Combobox
            aria-label="Origin"
            groups={originGroups}
            value={origin}
            onChange={v => onChange({ origin: v, destination: null })}
            placeholder="— Select origin —"
          />
        </Field>
        <div className="hidden md:block text-orange text-2xl font-bold pb-2">→</div>
        <Field label="Destination" className="flex-1">
          <Combobox
            aria-label="Destination"
            groups={destGroups}
            value={destination}
            onChange={v => onChange({ destination: v })}
            placeholder="— Select destination —"
            disabled={!origin}
            disabledPlaceholder="— Select origin first —"
          />
        </Field>
      </div>
      <Checkbox
        wrapperClassName="mt-4"
        checked={freeZone}
        onChange={e => onChange({ freeZone: e.target.checked })}
        label="This shipment involves a Free Zone / SEZ"
      />
    </Card>
  );
}
