import { describe, it, expect } from 'vitest';
import { findLaneOverlay } from '@/lib/lane-overlay';
import type { Lane } from '@/lib/types';

const lane = (over: Partial<Lane>): Lane => ({
  id: over.id ?? 'l',
  originId: over.originId ?? 'o',
  destinationId: over.destinationId ?? 'd',
  ftaId: over.ftaId ?? null,
  isFreeZone: over.isFreeZone ?? false,
  cooForm: over.cooForm ?? '',
  notes: over.notes ?? '',
});

describe('findLaneOverlay', () => {
  it('returns null when no lane row exists for the pair', () => {
    expect(findLaneOverlay([], { originId: 'o', destinationId: 'd', isFreeZone: false }))
      .toEqual({ lane: null, freeZoneFallback: false });
  });

  it('returns the standard lane when isFreeZone=false', () => {
    const std = lane({ id: 'std' });
    const fz  = lane({ id: 'fz', isFreeZone: true });
    const r = findLaneOverlay([std, fz], { originId: 'o', destinationId: 'd', isFreeZone: false });
    expect(r.lane?.id).toBe('std');
    expect(r.freeZoneFallback).toBe(false);
  });

  it('returns the FZ lane when isFreeZone=true and one exists', () => {
    const std = lane({ id: 'std' });
    const fz  = lane({ id: 'fz', isFreeZone: true });
    const r = findLaneOverlay([std, fz], { originId: 'o', destinationId: 'd', isFreeZone: true });
    expect(r.lane?.id).toBe('fz');
    expect(r.freeZoneFallback).toBe(false);
  });

  it('falls back to the standard lane when isFreeZone=true but no FZ row', () => {
    const std = lane({ id: 'std' });
    const r = findLaneOverlay([std], { originId: 'o', destinationId: 'd', isFreeZone: true });
    expect(r.lane?.id).toBe('std');
    expect(r.freeZoneFallback).toBe(true);
  });

  it('ignores lanes for unrelated pairs', () => {
    const other = lane({ id: 'other', originId: 'x', destinationId: 'y' });
    expect(findLaneOverlay([other], { originId: 'o', destinationId: 'd', isFreeZone: false }))
      .toEqual({ lane: null, freeZoneFallback: false });
  });
});
