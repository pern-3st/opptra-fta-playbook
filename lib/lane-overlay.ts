import type { Lane } from './types';

export interface LaneQuery { originId: string; destinationId: string; isFreeZone: boolean }
export interface LaneOverlay { lane: Lane | null; freeZoneFallback: boolean }

export function findLaneOverlay(lanes: Lane[], q: LaneQuery): LaneOverlay {
  const pair = lanes.filter(l => l.originId === q.originId && l.destinationId === q.destinationId);
  if (pair.length === 0) return { lane: null, freeZoneFallback: false };
  if (q.isFreeZone) {
    const fz = pair.find(l => l.isFreeZone);
    if (fz) return { lane: fz, freeZoneFallback: false };
    const std = pair.find(l => !l.isFreeZone);
    return { lane: std ?? null, freeZoneFallback: !!std };
  }
  return { lane: pair.find(l => !l.isFreeZone) ?? pair[0], freeZoneFallback: false };
}
