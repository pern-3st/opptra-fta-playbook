'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Country, FTA, Lane } from '@/lib/types';
import { Input } from './ui/input';

interface Props { countries: Country[]; ftas: FTA[]; lanes: Lane[]; defaultCollapsed?: boolean }

export function ReferenceTable({ countries, ftas, lanes, defaultCollapsed = false }: Props) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const prevCollapsed = useRef(defaultCollapsed);
  // Auto-collapse when the user transitions into the "lane selected" state,
  // but never auto-open — preserve user agency once they've toggled.
  useEffect(() => {
    if (defaultCollapsed && !prevCollapsed.current) setOpen(false);
    prevCollapsed.current = defaultCollapsed;
  }, [defaultCollapsed]);

  const [q, setQ] = useState('');
  const cById = useMemo(() => new Map(countries.map(c => [c.id, c])), [countries]);
  const fById = useMemo(() => new Map(ftas.map(f => [f.id, f])), [ftas]);
  const rows = useMemo(() => {
    return lanes
      .map(l => ({
        origin: cById.get(l.originId)?.name ?? '?',
        destination: cById.get(l.destinationId)?.name ?? '?',
        fta: l.ftaId ? (fById.get(l.ftaId)?.shortCode || fById.get(l.ftaId)?.name || '—') : 'No FTA',
        coo: l.cooForm || (l.ftaId ? fById.get(l.ftaId)?.cooForm : '') || '—',
        notes: l.notes,
        isFreeZone: l.isFreeZone,
      }))
      .filter(r => {
        if (!q) return true;
        const s = q.toLowerCase();
        return r.origin.toLowerCase().includes(s)
          || r.destination.toLowerCase().includes(s)
          || r.fta.toLowerCase().includes(s)
          || r.coo.toLowerCase().includes(s);
      });
  }, [lanes, cById, fById, q]);

  return (
    <section className="mt-10">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="reference-table-body"
        className="w-full flex items-center justify-between text-left group"
      >
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1 flex items-center gap-2">
            All FTA Lanes — Quick Reference
            <span className="text-sm font-medium text-grey">({lanes.length})</span>
          </h2>
          <p className="text-sm text-grey">Configured trade lanes, applicable agreements, and Certificate of Origin types</p>
        </div>
        <span
          aria-hidden
          className={`text-grey group-hover:text-navy transition-transform duration-300 ease-out shrink-0 ml-3 ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>
      <div
        id="reference-table-body"
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="mt-4">
            <Input placeholder="Search by country, FTA, or COO…" value={q} onChange={e => setQ(e.target.value)} className="max-w-md mb-3" />
            <div className="overflow-x-auto rounded-xl border border-grey-light/60 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-navy text-white">
                  <tr>
                    {['Origin', 'Destination', 'FTA', 'Free Zone', 'COO', 'Notes'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={i % 2 ? 'bg-canvas' : ''}>
                      <td className="px-4 py-2">{r.origin}</td>
                      <td className="px-4 py-2">{r.destination}</td>
                      <td className="px-4 py-2">{r.fta}</td>
                      <td className="px-4 py-2">{r.isFreeZone ? 'Yes' : ''}</td>
                      <td className="px-4 py-2">{r.coo}</td>
                      <td className="px-4 py-2 text-grey">{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
