import { describe, it, expect } from 'vitest';
import { sectionByHeadings, sectionFTABody, sectionComplianceDefaults, parseChapterClassifications } from '@/lib/sectioner';

const ftaSample = `Intro paragraph one.

Intro paragraph two.

## Tracks

- Normal: 0%
- Sensitive: 5%

## Chapter Notes

Sensitive chapters: 24, 87

## Extra Points

- Third-party invoicing allowed.

## Resources

- [ATIGA Text](https://asean.org/book/atiga/)

## Chapter Classifications

- Sensitive: 10, 17, 26, 27
- Excluded: 93
`;

describe('sectionByHeadings', () => {
  it('routes lines into named buckets based on H2 matches', () => {
    const out = sectionByHeadings(ftaSample, {
      lead: '__lead__',
      tracks: 'Tracks',
      resources: 'Resources',
    });
    expect(out.lead).toBe('Intro paragraph one.\n\nIntro paragraph two.');
    expect(out.tracks).toBe('- Normal: 0%\n- Sensitive: 5%');
    expect(out.resources).toBe('- [ATIGA Text](https://asean.org/book/atiga/)');
  });

  it('drops lines under unmapped headings', () => {
    const out = sectionByHeadings('## Unknown\n\nIgnored.\n', { lead: '__lead__' });
    expect(out.lead).toBe('');
  });
});

describe('sectionFTABody', () => {
  it('splits a page body into the known sections', () => {
    const out = sectionFTABody(ftaSample);
    expect(out.description).toBe('Intro paragraph one.\n\nIntro paragraph two.');
    expect(out.tracks).toBe('- Normal: 0%\n- Sensitive: 5%');
    expect(out.chapterNotes).toBe('Sensitive chapters: 24, 87');
    expect(out.extras).toBe('- Third-party invoicing allowed.');
    expect(out.resources).toBe('- [ATIGA Text](https://asean.org/book/atiga/)');
    expect(out.chapterClassifications).toEqual({ sensitive: ['24', '87', '10', '17', '26', '27'], excluded: ['93'] });
  });

  it('returns empty values for missing sections', () => {
    const out = sectionFTABody('Just a description, no headings.');
    expect(out.description).toBe('Just a description, no headings.');
    expect(out.tracks).toBe('');
    expect(out.chapterNotes).toBe('');
    expect(out.extras).toBe('');
    expect(out.resources).toBe('');
    expect(out.chapterClassifications).toEqual({ sensitive: [], excluded: [] });
  });
});

describe('parseChapterClassifications', () => {
  it('parses comma-separated chapter codes into sensitive and excluded buckets', () => {
    const out = parseChapterClassifications('- Sensitive: 10, 17, 26, 27\n- Excluded: 93');
    expect(out).toEqual({ sensitive: ['10', '17', '26', '27'], excluded: ['93'] });
  });

  it('accepts "Exclusion" or "Exclusion List" as aliases for excluded', () => {
    const out = parseChapterClassifications('- Sensitive List: 10\n- Exclusion List: 93');
    expect(out).toEqual({ sensitive: ['10'], excluded: ['93'] });
  });

  it('returns empty arrays when section is empty or labels missing', () => {
    expect(parseChapterClassifications('')).toEqual({ sensitive: [], excluded: [] });
    expect(parseChapterClassifications('- Sensitive:')).toEqual({ sensitive: [], excluded: [] });
  });

  it('accepts the migration-emitted "Sensitive chapters" / "Exclusion chapters" labels', () => {
    const out = parseChapterClassifications('Sensitive chapters: 10, 17, 26, 27\nExclusion chapters: 93');
    expect(out).toEqual({ sensitive: ['10', '17', '26', '27'], excluded: ['93'] });
  });

  it('tolerates extra whitespace and bullet variants', () => {
    const out = parseChapterClassifications('* Sensitive:  10  ,17 ,  26  \n* Excluded: 93');
    expect(out).toEqual({ sensitive: ['10', '17', '26'], excluded: ['93'] });
  });
});

describe('sectionComplianceDefaults', () => {
  it('matches the two known sections case-insensitively', () => {
    const md = `## Document Requirements\n\n- A\n\n## Claim Conditions\n\n- B\n`;
    const out = sectionComplianceDefaults(md);
    expect(out.documentRequirements).toBe('- A');
    expect(out.claimConditions).toBe('- B');
  });
  it('matches sentence-case headings ("Document requirements")', () => {
    const md = `## Document requirements\n\n- A\n\n## Claim conditions\n\n- B\n`;
    const out = sectionComplianceDefaults(md);
    expect(out.documentRequirements).toBe('- A');
    expect(out.claimConditions).toBe('- B');
  });
});
