import { describe, it, expect } from 'vitest';
import { findAlternativeFTAs } from '@/lib/alternatives';
import type { FTA } from '@/lib/types';

const blankBody = { description: '', tracks: '', chapterNotes: '', extras: '', resources: '' };
const fta = (over: Partial<FTA>): FTA => ({
  id: '', name: '', shortCode: '', fullName: '', status: 'Active', statusLabel: '',
  inForce: '', coverage: '', tariffFramework: '', cooForm: '', roo: '',
  validity: '', claimWindow: '', retention: '', description: '',
  priority: null, memberCountryIds: [], body: blankBody, ...over,
});

const ftas: FTA[] = [
  fta({ id: 'A', name: 'AIFTA',  memberCountryIds: ['IN', 'MY', 'TH'], priority: 10 }),
  fta({ id: 'M', name: 'MICECA', memberCountryIds: ['IN', 'MY'],       priority: 5  }),
  fta({ id: 'C', name: 'ACFTA',  memberCountryIds: ['CN', 'MY'],       priority: 20 }),
  fta({ id: 'N', name: 'No FTA', memberCountryIds: [],                 priority: 50 }),
];

describe('findAlternativeFTAs', () => {
  it('returns FTAs covering both origin and destination, excluding the primary, sorted by priority asc', () => {
    expect(findAlternativeFTAs(ftas, 'IN', 'MY', 'M').map(f => f.id)).toEqual(['A']);
  });
  it('omits the No FTA fallback even when its memberCountryIds is empty', () => {
    expect(findAlternativeFTAs(ftas, 'IN', 'MY', null).map(f => f.id)).toEqual(['M', 'A']);
  });
  it('returns [] when no alternatives match', () => {
    expect(findAlternativeFTAs(ftas, 'IN', 'JP', null)).toEqual([]);
  });
});
