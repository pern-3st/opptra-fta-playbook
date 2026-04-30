import { describe, it, expect } from 'vitest';
import { mapCountry, mapChapter, mapProduct, mapLane, mapFTAProperties } from '@/lib/mappers';
import * as f from './fixtures/notion-pages';

describe('mappers', () => {
  it('mapCountry reads every property the Country shape needs', () => {
    expect(mapCountry(f.countryPage)).toEqual({
      id: 'country-1', name: 'India', region: 'South Asia',
      regionSeq: 1, countrySeq: 1, notes: 'IN office',
    });
  });
  it('mapChapter', () => {
    expect(mapChapter(f.chapterPage)).toEqual({
      id: 'chapter-61', code: '61', name: 'Knitted/Crocheted Apparel',
      description: 'Articles of apparel, knitted or crocheted',
      section: 'Section XI', notes: '',
    });
  });
  it('mapProduct splits alternates and derives chapter code', () => {
    expect(mapProduct(f.productPage)).toEqual({
      id: 'product-1', name: 'cotton t-shirt', hsnPrimary: '61091000',
      hsnAlternates: ['6109', '610910'], description: 'Knitted cotton t-shirt',
      hsChapterCode: '61',
    });
  });
  it('mapLane', () => {
    expect(mapLane(f.lanePage)).toEqual({
      id: 'lane-1', originId: 'country-1', destinationId: 'country-2',
      ftaId: 'fta-1', isFreeZone: true, cooForm: 'Form X', notes: 'FZ-only',
    });
  });
  it('mapFTAProperties reads every FTA scalar property', () => {
    const out = mapFTAProperties(f.ftaPage);
    expect(out.id).toBe('fta-1');
    expect(out.name).toBe('ATIGA');
    expect(out.shortCode).toBe('ATIGA');
    expect(out.status).toBe('Active');
    expect(out.statusLabel).toBe('Active — 3.0 Protocol pending');
    expect(out.cooForm).toBe('Form D');
    expect(out.roo).toBe('40% RVC or CTH');
    expect(out.priority).toBe(10);
    expect(out.memberCountryIds).toEqual(['country-1', 'country-2']);
  });
});
