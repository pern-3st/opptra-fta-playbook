import { describe, it, expect } from 'vitest';
import { resolveFTA, matchingFTAs } from '@/lib/resolve-fta';
import type { FTA } from '@/lib/types';

const fta = (over: Partial<FTA>): FTA => ({
  id: over.id ?? 'fta',
  name: over.name ?? 'Test FTA',
  shortCode: over.shortCode ?? 'TST',
  fullName: '', status: 'Active', statusLabel: '', inForce: '', coverage: '',
  tariffFramework: '', cooForm: '', roo: '', validity: '', claimWindow: '',
  retention: '', description: '',
  priority: over.priority ?? 50,
  memberCountryIds: over.memberCountryIds ?? [],
  partnerCountryIds: over.partnerCountryIds ?? [],
  body: { description: '', tracks: '', chapterNotes: '', extras: '', resources: '',
    chapterClassifications: { sensitive: [], excluded: [] } },
  ...over,
});

describe('matchingFTAs', () => {
  it('matches symmetric multilateral when both countries are members', () => {
    const rcep = fta({ id: 'rcep', shortCode: 'RCEP', memberCountryIds: ['cn', 'jp', 'au'] });
    expect(matchingFTAs([rcep], 'cn', 'jp').map(f => f.id)).toEqual(['rcep']);
  });

  it('does NOT match when only one country is a member', () => {
    const rcep = fta({ id: 'rcep', memberCountryIds: ['cn', 'jp'] });
    expect(matchingFTAs([rcep], 'cn', 'in')).toEqual([]);
  });

  it('respects partners — bloc-partner FTA requires one side in partners', () => {
    const eujp = fta({
      id: 'eujp', shortCode: 'EU_JAPAN_EPA',
      memberCountryIds: ['de', 'fr', 'jp'],
      partnerCountryIds: ['jp'],
    });
    expect(matchingFTAs([eujp], 'de', 'jp').map(f => f.id)).toEqual(['eujp']);
    expect(matchingFTAs([eujp], 'jp', 'de').map(f => f.id)).toEqual(['eujp']);
    expect(matchingFTAs([eujp], 'de', 'fr')).toEqual([]);
  });

  it('returns multiple FTAs when overlapping', () => {
    const acfta = fta({ id: 'acfta', priority: 22, memberCountryIds: ['cn', 'my'] });
    const rcep  = fta({ id: 'rcep',  priority: 30, memberCountryIds: ['cn', 'my'] });
    expect(matchingFTAs([acfta, rcep], 'cn', 'my').map(f => f.id)).toEqual(['acfta', 'rcep']);
  });
});

describe('resolveFTA', () => {
  it('returns lowest-priority FTA as primary', () => {
    const acfta = fta({ id: 'acfta', shortCode: 'ACFTA', priority: 22, memberCountryIds: ['cn', 'my'] });
    const rcep  = fta({ id: 'rcep',  shortCode: 'RCEP',  priority: 30, memberCountryIds: ['cn', 'my'] });
    const r = resolveFTA([acfta, rcep], 'cn', 'my');
    expect(r?.primary.id).toBe('acfta');
    expect(r?.alternatives.map(f => f.id)).toEqual(['rcep']);
  });

  it('breaks priority ties by shortCode for determinism', () => {
    const a = fta({ id: 'a', shortCode: 'AAA', priority: 10, memberCountryIds: ['x', 'y'] });
    const b = fta({ id: 'b', shortCode: 'BBB', priority: 10, memberCountryIds: ['x', 'y'] });
    expect(resolveFTA([b, a], 'x', 'y')?.primary.id).toBe('a');
  });

  it('treats null priority as Infinity (lowest preference)', () => {
    const named = fta({ id: 'named',   priority: 22, memberCountryIds: ['x', 'y'] });
    const unset = fta({ id: 'unset',   priority: null, memberCountryIds: ['x', 'y'] });
    expect(resolveFTA([unset, named], 'x', 'y')?.primary.id).toBe('named');
  });

  it('returns null when no FTAs match', () => {
    const acfta = fta({ id: 'acfta', memberCountryIds: ['cn', 'my'] });
    expect(resolveFTA([acfta], 'in', 'us')).toBeNull();
  });

  it('excludes the fallback "No FTA" entity from matches', () => {
    const noFta = fta({ id: 'no', name: 'No FTA', memberCountryIds: ['x', 'y'] });
    const real  = fta({ id: 'real', priority: 10, memberCountryIds: ['x', 'y'] });
    expect(resolveFTA([noFta, real], 'x', 'y')?.primary.id).toBe('real');
    expect(resolveFTA([noFta], 'x', 'y')).toBeNull();
  });
});
