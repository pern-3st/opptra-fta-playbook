'use client';
import { useMemo, useState } from 'react';
import type { Country, FTA, FTAStatus, Lane } from '@/lib/types';
import { matchingFTAs } from '@/lib/resolve-fta';
import { statusTone } from '@/lib/status';
import { cn } from '@/lib/cn';
import { Disclosure } from './ui/disclosure';
import { SearchInput } from './ui/search-input';
import { Combobox, type ComboboxGroup } from './ui/combobox';
import { Popover } from './ui/popover';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, InfoIcon } from './ui/icon';

interface Props {
  countries: Country[];
  ftas: FTA[];
  lanes: Lane[];
  defaultCollapsed?: boolean;
}

interface Row {
  originId: string;
  origin: string;
  destinationId: string;
  destination: string;
  ftaId: string;
  fta: string;
  alternates: string[];
  status: FTAStatus;
  statusLabel: string;
  coo: string;
  notes: string;
  isFreeZone: boolean;
}

type SortKey = 'origin' | 'destination' | 'fta' | 'status' | 'coo';
type SortDir = 'asc' | 'desc';
type FzFilter = 'all' | 'std' | 'fz';

const COLUMNS: { key: SortKey | 'notes'; label: string; width: string; sortable: boolean }[] = [
  { key: 'origin', label: 'Origin', width: '17%', sortable: true },
  { key: 'destination', label: 'Destination', width: '19%', sortable: true },
  { key: 'fta', label: 'FTA', width: '20%', sortable: true },
  { key: 'status', label: 'Status', width: '16%', sortable: true },
  { key: 'coo', label: 'COO Form', width: '22%', sortable: true },
  { key: 'notes', label: '', width: '6%', sortable: false },
];

function regionGroups(countries: Country[]): ComboboxGroup[] {
  const buckets = new Map<string, { seq: number; countries: Country[] }>();
  for (const c of countries) {
    const label = c.region ?? 'Other';
    const seq = c.regionSeq ?? Number.POSITIVE_INFINITY;
    const bucket = buckets.get(label);
    if (bucket) {
      bucket.countries.push(c);
      if (seq < bucket.seq) bucket.seq = seq;
    } else {
      buckets.set(label, { seq, countries: [c] });
    }
  }
  return Array.from(buckets.entries())
    .sort((a, b) => a[1].seq - b[1].seq || a[0].localeCompare(b[0]))
    .map(([label, { countries }]) => ({
      label,
      options: countries
        .slice()
        .sort(
          (a, b) =>
            (a.countrySeq ?? Infinity) - (b.countrySeq ?? Infinity) || a.name.localeCompare(b.name),
        )
        .map(c => ({ value: c.id, label: c.name })),
    }));
}

function statusGroups(rows: Row[]): ComboboxGroup[] {
  const ORDER: Record<string, number> = { Active: 0, 'Under Review': 1, Negotiating: 2, Paused: 3, Inactive: 4, None: 5 };
  const seen = new Map<string, number>();
  for (const r of rows) {
    if (!r.status) continue;
    if (!seen.has(r.status)) seen.set(r.status, seen.size);
  }
  const options = Array.from(seen.keys())
    .sort((a, b) => (ORDER[a] ?? 99) - (ORDER[b] ?? 99) || a.localeCompare(b))
    .map(s => ({ value: s, label: s }));
  return options.length > 0 ? [{ label: 'Status', options }] : [];
}

function sortValue(r: Row, key: SortKey): string {
  if (key === 'status') return (r.statusLabel || r.status || '').toLowerCase();
  return r[key].toString().toLowerCase();
}

function ftaGroups(ftas: FTA[]): ComboboxGroup[] {
  const sorted = ftas.slice().sort(
    (a, b) =>
      (a.priority ?? Infinity) - (b.priority ?? Infinity) || a.shortCode.localeCompare(b.shortCode),
  );
  return [
    {
      label: 'Agreements',
      options: sorted.map(f => ({ value: f.id, label: f.shortCode || f.name })),
    },
  ];
}

export function ReferenceTable({ countries, ftas, lanes, defaultCollapsed = false }: Props) {
  const [q, setQ] = useState('');
  const [originFilter, setOriginFilter] = useState<string | null>(null);
  const [destinationFilter, setDestinationFilter] = useState<string | null>(null);
  const [ftaFilter, setFtaFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [fzFilter, setFzFilter] = useState<FzFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('origin');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const allRows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    const laneByKey = new Map<string, Lane>();
    for (const l of lanes) {
      laneByKey.set(`${l.originId}|${l.destinationId}|${l.isFreeZone ? 'fz' : 'std'}`, l);
    }
    for (const o of countries) {
      for (const d of countries) {
        if (o.id === d.id) continue;
        const matched = matchingFTAs(ftas, o.id, d.id).slice().sort(
          (a, b) =>
            (a.priority ?? Infinity) - (b.priority ?? Infinity) || a.shortCode.localeCompare(b.shortCode),
        );
        if (matched.length === 0) continue;
        const primary = matched[0];
        const alternates = matched.slice(1).map(f => f.shortCode || f.name);
        const stdLane = laneByKey.get(`${o.id}|${d.id}|std`);
        out.push({
          originId: o.id,
          origin: o.name,
          destinationId: d.id,
          destination: d.name,
          ftaId: primary.id,
          fta: primary.shortCode || primary.name,
          alternates,
          status: primary.status,
          statusLabel: primary.statusLabel,
          coo: stdLane?.cooForm || primary.cooForm || '—',
          notes: stdLane?.notes ?? '',
          isFreeZone: false,
        });
        const fzLane = laneByKey.get(`${o.id}|${d.id}|fz`);
        if (fzLane) {
          out.push({
            originId: o.id,
            origin: o.name,
            destinationId: d.id,
            destination: d.name,
            ftaId: primary.id,
            fta: primary.shortCode || primary.name,
            alternates,
            status: primary.status,
            statusLabel: primary.statusLabel,
            coo: fzLane.cooForm || primary.cooForm || '—',
            notes: fzLane.notes,
            isFreeZone: true,
          });
        }
      }
    }
    return out;
  }, [countries, ftas, lanes]);

  const ftasInPlay = useMemo(() => {
    const ids = new Set<string>();
    for (const r of allRows) ids.add(r.ftaId);
    return ftas.filter(f => ids.has(f.id));
  }, [allRows, ftas]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allRows.filter(r => {
      if (originFilter && r.originId !== originFilter) return false;
      if (destinationFilter && r.destinationId !== destinationFilter) return false;
      if (ftaFilter && r.ftaId !== ftaFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (fzFilter === 'std' && r.isFreeZone) return false;
      if (fzFilter === 'fz' && !r.isFreeZone) return false;
      if (!term) return true;
      return (
        r.origin.toLowerCase().includes(term) ||
        r.destination.toLowerCase().includes(term) ||
        r.fta.toLowerCase().includes(term) ||
        r.alternates.some(a => a.toLowerCase().includes(term)) ||
        r.statusLabel.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term) ||
        r.coo.toLowerCase().includes(term) ||
        r.notes.toLowerCase().includes(term)
      );
    });
  }, [allRows, q, originFilter, destinationFilter, ftaFilter, statusFilter, fzFilter]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return filtered.slice().sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      // Stable secondary ordering: keep std/fz pairs together with std first
      if (a.originId !== b.originId) return a.origin.localeCompare(b.origin);
      if (a.destinationId !== b.destinationId) return a.destination.localeCompare(b.destination);
      return Number(a.isFreeZone) - Number(b.isFreeZone);
    });
  }, [filtered, sortKey, sortDir]);

  const filtersActive =
    !!q || !!originFilter || !!destinationFilter || !!ftaFilter || !!statusFilter || fzFilter !== 'all';

  const originOptionGroups = useMemo(() => regionGroups(countries), [countries]);
  const destinationOptionGroups = useMemo(() => regionGroups(countries), [countries]);
  const ftaOptionGroups = useMemo(() => ftaGroups(ftasInPlay), [ftasInPlay]);
  const statusOptionGroups = useMemo(() => statusGroups(allRows), [allRows]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function clearFilters() {
    setQ('');
    setOriginFilter(null);
    setDestinationFilter(null);
    setFtaFilter(null);
    setStatusFilter(null);
    setFzFilter('all');
  }

  return (
    <Disclosure
      className="mt-10"
      defaultOpen={!defaultCollapsed}
      collapseOn={defaultCollapsed}
      title="All FTA Lanes — Quick Reference"
      subtitle="Configured trade lanes, applicable agreements, and Certificate of Origin types"
      aside={<Badge tone="grey">{sorted.length}</Badge>}
    >
      <FiltersBar
        q={q}
        onQ={setQ}
        originGroups={originOptionGroups}
        destinationGroups={destinationOptionGroups}
        ftaGroups={ftaOptionGroups}
        statusGroups={statusOptionGroups}
        originFilter={originFilter}
        onOriginFilter={setOriginFilter}
        destinationFilter={destinationFilter}
        onDestinationFilter={setDestinationFilter}
        ftaFilter={ftaFilter}
        onFtaFilter={setFtaFilter}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        fzFilter={fzFilter}
        onFzFilter={setFzFilter}
        showClear={filtersActive}
        onClear={clearFilters}
        showing={sorted.length}
        total={allRows.length}
      />
      <div className="mt-3 rounded-xl border border-grey-light/60 bg-white overflow-hidden">
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              {COLUMNS.map(c => (
                <col key={c.key} style={{ width: c.width }} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-canvas border-b border-grey-light/60">
              <tr>
                {COLUMNS.map(c => (
                  <th
                    key={c.key}
                    scope="col"
                    className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-grey"
                  >
                    {c.sortable ? (
                      <SortHeader
                        label={c.label}
                        active={sortKey === c.key}
                        dir={sortDir}
                        onClick={() => toggleSort(c.key as SortKey)}
                      />
                    ) : (
                      c.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-sm text-grey">
                    No lanes match the current filters.
                  </td>
                </tr>
              )}
              {sorted.map((r, i) => {
                const prev = sorted[i - 1];
                const groupBreak = sortKey === 'origin' && prev && prev.originId !== r.originId;
                return (
                  <TableRow
                    key={`${r.originId}-${r.destinationId}-${r.isFreeZone ? 'fz' : 'std'}`}
                    row={r}
                    groupBreak={groupBreak}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Disclosure>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  const Icon = !active ? ArrowUpDownIcon : dir === 'asc' ? ArrowUpIcon : ArrowDownIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 -mx-1 px-1 rounded transition-colors',
        'hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40',
        active && 'text-navy',
      )}
    >
      <span>{label}</span>
      <Icon size={12} className={cn(active ? 'text-navy' : 'text-grey-light')} />
    </button>
  );
}

function TableRow({
  row,
  groupBreak,
}: {
  row: Row;
  groupBreak: boolean;
}) {
  return (
    <tr
      className={cn(
        'border-t border-grey-light/40 align-top',
        groupBreak && 'border-t-2 border-navy/10',
      )}
    >
      <td className="px-4 py-2.5 text-navy">{row.origin}</td>
      <td className="px-4 py-2.5 text-navy">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>{row.destination}</span>
          {row.isFreeZone && (
            <Badge tone="orange" variant="outline">
              Free Zone
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex flex-col gap-1 items-start">
          <Badge tone="navy">{row.fta}</Badge>
          {row.alternates.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {row.alternates.map(a => (
                <Badge key={a} tone="grey" variant="outline">
                  {a}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5">
        {row.status && (
          <Badge {...statusTone(row.status)}>{row.statusLabel || row.status}</Badge>
        )}
      </td>
      <td className="px-4 py-2.5 text-navy">{row.coo}</td>
      <td className="px-4 py-2.5">
        {row.notes && (
          <Popover
            triggerLabel="View lane notes"
            align="end"
            trigger={<InfoIcon size={16} />}
          >
            <p className="text-grey leading-relaxed">{row.notes}</p>
          </Popover>
        )}
      </td>
    </tr>
  );
}

interface FiltersBarProps {
  q: string;
  onQ: (v: string) => void;
  originGroups: ComboboxGroup[];
  destinationGroups: ComboboxGroup[];
  ftaGroups: ComboboxGroup[];
  statusGroups: ComboboxGroup[];
  originFilter: string | null;
  onOriginFilter: (v: string | null) => void;
  destinationFilter: string | null;
  onDestinationFilter: (v: string | null) => void;
  ftaFilter: string | null;
  onFtaFilter: (v: string | null) => void;
  statusFilter: string | null;
  onStatusFilter: (v: string | null) => void;
  fzFilter: FzFilter;
  onFzFilter: (v: FzFilter) => void;
  showClear: boolean;
  onClear: () => void;
  showing: number;
  total: number;
}

function FiltersBar({
  q,
  onQ,
  originGroups,
  destinationGroups,
  ftaGroups,
  statusGroups,
  originFilter,
  onOriginFilter,
  destinationFilter,
  onDestinationFilter,
  ftaFilter,
  onFtaFilter,
  statusFilter,
  onStatusFilter,
  fzFilter,
  onFzFilter,
  showClear,
  onClear,
  showing,
  total,
}: FiltersBarProps) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
        <SearchInput
          className="md:col-span-4"
          value={q}
          onChange={onQ}
          placeholder="Search country, FTA, status, COO, notes…"
        />
        <Combobox
          className="md:col-span-3"
          aria-label="Filter by origin"
          groups={originGroups}
          value={originFilter}
          onChange={onOriginFilter}
          placeholder="All origins"
        />
        <Combobox
          className="md:col-span-3"
          aria-label="Filter by destination"
          groups={destinationGroups}
          value={destinationFilter}
          onChange={onDestinationFilter}
          placeholder="All destinations"
        />
        <Combobox
          className="md:col-span-2"
          aria-label="Filter by FTA"
          groups={ftaGroups}
          value={ftaFilter}
          onChange={onFtaFilter}
          placeholder="All FTAs"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedFreeZone value={fzFilter} onChange={onFzFilter} />
        <Combobox
          className="w-full md:w-56"
          aria-label="Filter by status"
          groups={statusGroups}
          value={statusFilter}
          onChange={onStatusFilter}
          placeholder="All statuses"
        />
        <div className="ml-auto flex items-center gap-3 text-xs text-grey">
          <span>
            Showing <span className="font-semibold text-navy">{showing}</span> of {total}
          </span>
          {showClear && (
            <Button variant="link" size="sm" onClick={onClear}>
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SegmentedFreeZone({
  value,
  onChange,
  className,
}: {
  value: FzFilter;
  onChange: (v: FzFilter) => void;
  className?: string;
}) {
  const options: { value: FzFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'std', label: 'Standard' },
    { value: 'fz', label: 'Free Zone' },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Lane type"
      className={cn(
        'inline-flex w-full md:w-auto items-stretch rounded-lg border-[1.5px] border-grey-light bg-white p-0.5',
        className,
      )}
    >
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40',
              active ? 'bg-navy text-white' : 'text-grey hover:text-navy',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
