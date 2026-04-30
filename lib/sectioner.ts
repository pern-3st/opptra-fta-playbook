const LEAD = '__lead__';

export function sectionByHeadings<K extends string>(
  md: string,
  headings: Record<K, string>,
  options: { caseInsensitive?: boolean } = {},
): Record<K, string> {
  const norm = (s: string) => options.caseInsensitive ? s.toLowerCase() : s;
  const byHeading = new Map<string, K>();
  for (const [bucket, heading] of Object.entries(headings) as [K, string][]) {
    if (heading !== LEAD) byHeading.set(norm(heading), bucket);
  }
  const buffers = {} as Record<K, string[]>;
  for (const k of Object.keys(headings) as K[]) buffers[k] = [];

  const leadKey = (Object.entries(headings) as [K, string][])
    .find(([, v]) => v === LEAD)?.[0];
  let current: K | null = leadKey ?? null;

  for (const line of md.split('\n')) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      current = byHeading.get(norm(m[1])) ?? null;
      continue;
    }
    if (current) buffers[current].push(line);
  }

  const out = {} as Record<K, string>;
  for (const k of Object.keys(headings) as K[]) {
    out[k] = buffers[k].join('\n').trim();
  }
  return out;
}

export interface FTASections {
  description: string;
  tracks: string;
  chapterNotes: string;
  extras: string;
  resources: string;
}

export function sectionFTABody(md: string): FTASections {
  return sectionByHeadings(md, {
    description: LEAD,
    tracks: 'Tracks',
    chapterNotes: 'Chapter Notes',
    extras: 'Extra Points',
    resources: 'Resources',
  });
}

export interface ComplianceSections {
  documentRequirements: string;
  claimConditions: string;
}

export function sectionComplianceDefaults(md: string): ComplianceSections {
  return sectionByHeadings(
    md,
    { documentRequirements: 'Document Requirements', claimConditions: 'Claim Conditions' },
    { caseInsensitive: true },
  );
}

export { LEAD };
