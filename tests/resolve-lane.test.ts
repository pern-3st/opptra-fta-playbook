import { describe, it, expect } from 'vitest';
import { resolveLane } from '@/lib/resolve-lane';
import type { Lane } from '@/lib/types';

const lanes: Lane[] = [
  { id: 'L1', originId: 'IN', destinationId: 'AE', ftaId: 'CEPA', isFreeZone: false, cooForm: '', notes: '' },
  { id: 'L2', originId: 'IN', destinationId: 'AE', ftaId: 'CEPA', isFreeZone: true,  cooForm: 'Free-zone form X', notes: 'FZ note' },
  { id: 'L3', originId: 'IN', destinationId: 'JP', ftaId: null,    isFreeZone: false, cooForm: '', notes: 'No FTA' },
];

describe('resolveLane', () => {
  it('returns the matching standard lane', () => {
    expect(resolveLane(lanes, { originId: 'IN', destinationId: 'AE', isFreeZone: false }))
      .toEqual({ lane: lanes[0], freeZoneFallback: false });
  });
  it('returns the free-zone variant when toggle is on', () => {
    expect(resolveLane(lanes, { originId: 'IN', destinationId: 'AE', isFreeZone: true }))
      .toEqual({ lane: lanes[1], freeZoneFallback: false });
  });
  it('falls back to the standard lane and flags it when no free-zone variant exists', () => {
    expect(resolveLane(lanes, { originId: 'IN', destinationId: 'JP', isFreeZone: true }))
      .toEqual({ lane: lanes[2], freeZoneFallback: true });
  });
  it('returns null when no lane row matches', () => {
    expect(resolveLane(lanes, { originId: 'IN', destinationId: 'CN', isFreeZone: false })).toBeNull();
  });
});
