import type { FTA } from './types';
import { FALLBACK_FTA_NAME } from './fallback';

export function findAlternativeFTAs(
  ftas: FTA[],
  originId: string,
  destinationId: string,
  primaryFtaId: string | null,
): FTA[] {
  return ftas
    .filter(f => f.name !== FALLBACK_FTA_NAME)
    .filter(f => f.id !== primaryFtaId)
    .filter(f =>
      f.memberCountryIds.includes(originId) &&
      f.memberCountryIds.includes(destinationId),
    )
    .sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity));
}
