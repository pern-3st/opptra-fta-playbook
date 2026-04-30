import type { FTA } from './types';
import { FALLBACK_FTA_NAME } from './fallback';

export interface FTAResolution {
  primary: FTA;
  alternatives: FTA[];
}

export function matchingFTAs(ftas: FTA[], originId: string, destinationId: string): FTA[] {
  return ftas
    .filter(f => f.name !== FALLBACK_FTA_NAME)
    .filter(f => {
      const members = f.memberCountryIds;
      if (!members.includes(originId) || !members.includes(destinationId)) return false;
      const partners = f.partnerCountryIds ?? [];
      if (partners.length === 0) return true;
      return partners.includes(originId) || partners.includes(destinationId);
    });
}

const PRIORITY_HI = Number.POSITIVE_INFINITY;

export function resolveFTA(ftas: FTA[], originId: string, destinationId: string): FTAResolution | null {
  const matches = matchingFTAs(ftas, originId, destinationId).slice().sort((a, b) => {
    const pa = a.priority ?? PRIORITY_HI;
    const pb = b.priority ?? PRIORITY_HI;
    if (pa !== pb) return pa - pb;
    return a.shortCode.localeCompare(b.shortCode);
  });
  if (matches.length === 0) return null;
  return { primary: matches[0], alternatives: matches.slice(1) };
}
