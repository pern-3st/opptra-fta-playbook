import type { FTA } from './types';

export const FALLBACK_FTA_NAME = 'No FTA';

export function findFallbackFTA(ftas: FTA[]): FTA | null {
  return ftas.find(f => f.name === FALLBACK_FTA_NAME) ?? null;
}

export interface ResolvedPlaybookFields {
  cooForm: string;
  validity: string;
  claimWindow: string;
  retention: string;
}

export function resolveFallbackPlaybookFields(
  fta: FTA,
  fallback: FTA | null,
): ResolvedPlaybookFields {
  const pick = (own: string, fb: string | undefined) => own || fb || '';
  return {
    cooForm:     pick(fta.cooForm,     fallback?.cooForm),
    validity:    pick(fta.validity,    fallback?.validity),
    claimWindow: pick(fta.claimWindow, fallback?.claimWindow),
    retention:   pick(fta.retention,   fallback?.retention),
  };
}
