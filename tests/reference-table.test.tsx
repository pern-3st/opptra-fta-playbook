// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReferenceTable } from '@/components/reference-table';
import type { Country, FTA, Lane } from '@/lib/types';

const C = (id: string, name: string): Country => ({
  id, name, region: 'X', regionSeq: 1, countrySeq: 1, notes: '',
});
const f = (over: Partial<FTA>): FTA => ({
  id: over.id!, name: over.name ?? 'F', shortCode: over.shortCode ?? 'F',
  fullName: '', status: 'Active', statusLabel: '', inForce: '', coverage: '',
  tariffFramework: '', cooForm: over.cooForm ?? '', roo: '', validity: '',
  claimWindow: '', retention: '', description: '',
  priority: over.priority ?? 50,
  memberCountryIds: over.memberCountryIds ?? [],
  partnerCountryIds: over.partnerCountryIds ?? [],
  body: { description: '', tracks: '', chapterNotes: '', extras: '', resources: '',
    chapterClassifications: { sensitive: [], excluded: [] } },
});

describe('ReferenceTable', () => {
  it('lists every membership-implied pair (no Lane rows required)', () => {
    const countries = [C('cn', 'China'), C('my', 'Malaysia'), C('id', 'Indonesia')];
    const acfta = f({ id: 'acfta', shortCode: 'ACFTA', priority: 22,
      memberCountryIds: ['cn', 'my', 'id'] });
    const { container } = render(
      <ReferenceTable countries={countries} ftas={[acfta]} lanes={[]} />,
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(6);
    expect(screen.getAllByText('ACFTA').length).toBeGreaterThan(0);
  });

  it('adds a free-zone row when a FZ Lane row exists for a pair', () => {
    const countries = [C('uae', 'UAE'), C('in', 'India')];
    const cepa = f({ id: 'cepa', shortCode: 'CEPA', priority: 10,
      memberCountryIds: ['uae', 'in'] });
    const fzLane: Lane = {
      id: 'fz', originId: 'uae', destinationId: 'in', ftaId: 'cepa',
      isFreeZone: true, cooForm: 'CEPA-FZ form', notes: 'FZ rules apply',
    };
    const { container } = render(
      <ReferenceTable countries={countries} ftas={[cepa]} lanes={[fzLane]} />,
    );
    expect(container.querySelectorAll('tbody tr').length).toBe(3);
    expect(screen.getByText('FZ rules apply')).toBeTruthy();
  });

  it('does not generate "No FTA" rows — only matched pairs are listed', () => {
    const countries = [C('a', 'A'), C('b', 'B')];
    const ftas: FTA[] = [];
    const { container } = render(
      <ReferenceTable countries={countries} ftas={ftas} lanes={[]} />,
    );
    expect(container.querySelectorAll('tbody tr').length).toBe(0);
  });
});
