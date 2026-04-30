import { describe, it, expect } from 'vitest';
import { findFallbackFTA, resolveFallbackPlaybookFields } from '@/lib/fallback';
import type { FTA } from '@/lib/types';

const blankBody = { description: '', tracks: '', chapterNotes: '', extras: '', resources: '' };
const fta = (over: Partial<FTA>): FTA => ({
  id: '', name: '', shortCode: '', fullName: '', status: 'Active', statusLabel: '',
  inForce: '', coverage: '', tariffFramework: '', cooForm: '', roo: '',
  validity: '', claimWindow: '', retention: '', description: '',
  priority: null, memberCountryIds: [], body: blankBody, ...over,
});

const fallback = fta({
  id: 'NONE', name: 'No FTA',
  cooForm: 'Standard commercial invoice (fallback)',
  validity: '6–12 months (fallback)',
  claimWindow: 'WTO MFN rates apply (fallback)',
  retention: '5 years (fallback)',
});

describe('findFallbackFTA', () => {
  it('finds the FTA named "No FTA"', () => {
    expect(findFallbackFTA([fta({ id: 'X' }), fallback])?.id).toBe('NONE');
  });
  it('returns null when no fallback FTA exists', () => {
    expect(findFallbackFTA([fta({ id: 'X' })])).toBeNull();
  });
});

describe('resolveFallbackPlaybookFields', () => {
  it('uses fta values when present', () => {
    const f = fta({ cooForm: 'X', validity: 'Y', claimWindow: 'Z', retention: 'W' });
    expect(resolveFallbackPlaybookFields(f, fallback)).toEqual({
      cooForm: 'X', validity: 'Y', claimWindow: 'Z', retention: 'W',
    });
  });
  it('falls back to NONE values when fields are empty', () => {
    const f = fta({ cooForm: 'X' });
    expect(resolveFallbackPlaybookFields(f, fallback)).toEqual({
      cooForm: 'X',
      validity: '6–12 months (fallback)',
      claimWindow: 'WTO MFN rates apply (fallback)',
      retention: '5 years (fallback)',
    });
  });
  it('returns the fta values unchanged when no fallback is provided', () => {
    const f = fta({});
    expect(resolveFallbackPlaybookFields(f, null)).toEqual({
      cooForm: '', validity: '', claimWindow: '', retention: '',
    });
  });
});
