import type { Lane } from './types';

export interface LaneQuery { originId: string; destinationId: string; isFreeZone: boolean }
export interface LaneResolution { lane: Lane; freeZoneFallback: boolean }

export function resolveLane(lanes: Lane[], q: LaneQuery): LaneResolution | null {
  const pair = lanes.filter(l => l.originId === q.originId && l.destinationId === q.destinationId);
  if (pair.length === 0) return null;
  if (q.isFreeZone) {
    const fz = pair.find(l => l.isFreeZone);
    if (fz) return { lane: fz, freeZoneFallback: false };
    const std = pair.find(l => !l.isFreeZone);
    if (std) return { lane: std, freeZoneFallback: true };
    return null;
  }
  return { lane: pair.find(l => !l.isFreeZone) ?? pair[0], freeZoneFallback: false };
}
