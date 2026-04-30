import { describe, it, expect } from 'vitest';
import { searchProductsByName, searchProductsByHSN, normalizeHSN, classifyQuery, searchProducts, searchChapters, highlightMatch, countProductsByChapter } from '@/lib/search';
import type { Product, HSChapter } from '@/lib/types';

const products: Product[] = [
  { id: 'p1', name: 'gaming chair', hsnPrimary: '94042900', hsnAlternates: ['9401'], description: 'Office gaming chair', hsChapterCode: '94' },
  { id: 'p2', name: 'cotton t-shirt', hsnPrimary: '61091000', hsnAlternates: [], description: 'Knitted cotton t-shirt', hsChapterCode: '61' },
  { id: 'p3', name: 'mattress', hsnPrimary: '94042100', hsnAlternates: [], description: 'Foam mattress', hsChapterCode: '94' },
  { id: 'p4', name: 'bicycle', hsnPrimary: '87120010', hsnAlternates: [], description: 'Two-wheeler', hsChapterCode: '87' },
];

describe('searchProductsByName', () => {
  it('returns substring matches on name and description, case-insensitive', () => {
    const r = searchProductsByName(products, 'cotton');
    expect(r.map(p => p.id)).toEqual(['p2']);
  });
  it('returns at most 10 results', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ ...products[0], id: `x${i}` }));
    expect(searchProductsByName(many, 'chair').length).toBe(10);
  });
  it('returns empty for empty query', () => {
    expect(searchProductsByName(products, '')).toEqual([]);
  });
  it('strips a trailing s as a fallback when the literal query has no hits', () => {
    const r = searchProductsByName(products, 'mattresses');
    expect(r.map(p => p.id)).toEqual(['p3']);
  });
  it('ranks all-token matches above partial-token matches', () => {
    const list: Product[] = [
      { id: 'a', name: 'office gaming chair', hsnPrimary: '94013000', hsnAlternates: [], description: '', hsChapterCode: '94' },
      { id: 'b', name: 'office desk', hsnPrimary: '94032000', hsnAlternates: [], description: '', hsChapterCode: '94' },
    ];
    const r = searchProductsByName(list, 'office chair');
    expect(r[0].id).toBe('a');
  });
});

describe('normalizeHSN', () => {
  it('strips non-digit characters', () => {
    expect(normalizeHSN('94.04.29.00')).toBe('94042900');
    expect(normalizeHSN(' 6109 ')).toBe('6109');
  });
});

describe('searchProductsByHSN', () => {
  it('returns chapter products for a 2-digit query', () => {
    const r = searchProductsByHSN(products, '94');
    expect(r.map(p => p.id).sort()).toEqual(['p1', 'p3']);
  });
  it('returns prefix matches against primary and alternates for 4+ digits', () => {
    expect(searchProductsByHSN(products, '9404').map(p => p.id).sort()).toEqual(['p1', 'p3']);
    expect(searchProductsByHSN(products, '9401').map(p => p.id)).toEqual(['p1']);
  });
  it('caps the result list at MAX_RESULTS', () => {
    const many = Array.from({ length: 50 }, (_, i) => ({
      ...products[0], id: `x${i}`, hsnPrimary: `9404${String(i).padStart(4, '0')}`,
    }));
    expect(searchProductsByHSN(many, '9404').length).toBeLessThanOrEqual(20);
  });
  it('returns empty for non-digit input', () => {
    expect(searchProductsByHSN(products, 'abc')).toEqual([]);
  });
  it('returns empty when nothing matches', () => {
    expect(searchProductsByHSN(products, '99999')).toEqual([]);
  });
});

const chapters: HSChapter[] = [
  { id: 'c94', code: '94', name: 'Furniture', description: '', section: '', notes: '' },
  { id: 'c61', code: '61', name: 'Apparel — knit', description: '', section: '', notes: '' },
  { id: 'c87', code: '87', name: 'Vehicles', description: '', section: '', notes: '' },
];

describe('classifyQuery', () => {
  it('returns empty for whitespace-only', () => {
    expect(classifyQuery('   ', chapters)).toEqual({ kind: 'empty' });
  });
  it('treats non-digit text as name', () => {
    expect(classifyQuery('chair', chapters)).toEqual({ kind: 'name', name: 'chair' });
  });
  it('classifies digits with a known chapter prefix', () => {
    expect(classifyQuery('94', chapters)).toEqual({
      kind: 'hsn', digits: '94', knownChapter: chapters[0], exactly8: false,
    });
  });
  it('flags exactly-8-digit input with a known chapter prefix', () => {
    expect(classifyQuery('94013000', chapters)).toEqual({
      kind: 'hsn', digits: '94013000', knownChapter: chapters[0], exactly8: true,
    });
  });
  it('classifies digits with no known chapter prefix', () => {
    expect(classifyQuery('99', chapters)).toEqual({
      kind: 'hsn', digits: '99', knownChapter: null, exactly8: false,
    });
  });
  it('strips non-digits before classifying', () => {
    expect(classifyQuery('94.04.29.00', chapters)).toEqual({
      kind: 'hsn', digits: '94042900', knownChapter: chapters[0], exactly8: true,
    });
  });
});

describe('searchChapters', () => {
  it('returns empty for empty query', () => {
    expect(searchChapters(chapters, '')).toEqual([]);
  });
  it('returns empty for digit-only queries (handled by classifyQuery)', () => {
    expect(searchChapters(chapters, '94')).toEqual([]);
  });
  it('matches chapter name case-insensitively', () => {
    expect(searchChapters(chapters, 'furn').map(c => c.code)).toEqual(['94']);
    expect(searchChapters(chapters, 'FURNITURE').map(c => c.code)).toEqual(['94']);
  });
  it('returns multiple chapters when several match', () => {
    const more: HSChapter[] = [
      ...chapters,
      { id: 'c62', code: '62', name: 'Apparel — woven', description: '', section: '', notes: '' },
    ];
    expect(searchChapters(more, 'apparel').map(c => c.code).sort()).toEqual(['61', '62']);
  });
  it('caps results to a small number', () => {
    const many: HSChapter[] = Array.from({ length: 30 }, (_, i) => ({
      id: `c${i}`, code: String(i).padStart(2, '0'), name: 'Furniture variant', description: '', section: '', notes: '',
    }));
    expect(searchChapters(many, 'furn').length).toBeLessThanOrEqual(5);
  });
});

describe('highlightMatch', () => {
  it('returns a single non-match segment when query is empty', () => {
    expect(highlightMatch('Gaming chair', '')).toEqual([{ text: 'Gaming chair', match: false }]);
  });
  it('returns segments around a single match (case-insensitive)', () => {
    expect(highlightMatch('Gaming chair', 'chair')).toEqual([
      { text: 'Gaming ', match: false },
      { text: 'chair', match: true },
    ]);
  });
  it('preserves the original casing of the matched segment', () => {
    expect(highlightMatch('Cotton T-shirt', 'cotton')).toEqual([
      { text: 'Cotton', match: true },
      { text: ' T-shirt', match: false },
    ]);
  });
  it('returns the whole text as a non-match when query is not found', () => {
    expect(highlightMatch('Gaming chair', 'xyz')).toEqual([{ text: 'Gaming chair', match: false }]);
  });
});

describe('countProductsByChapter', () => {
  it('returns a map of chapter code → product count', () => {
    const counts = countProductsByChapter(products);
    expect(counts.get('94')).toBe(2);
    expect(counts.get('61')).toBe(1);
    expect(counts.get('87')).toBe(1);
    expect(counts.get('05')).toBeUndefined();
  });
  it('returns an empty map for no products', () => {
    expect(countProductsByChapter([]).size).toBe(0);
  });
});

describe('searchProducts (unified, with chapter filter)', () => {
  it('with no query and no filter, returns []', () => {
    expect(searchProducts(products, '', null)).toEqual([]);
  });
  it('with a name query and no filter, returns name matches', () => {
    expect(searchProducts(products, 'chair', null).map(p => p.id)).toEqual(['p1']);
  });
  it('with a digit query, returns HSN-prefix matches', () => {
    expect(searchProducts(products, '9404', null).map(p => p.id).sort()).toEqual(['p1', 'p3']);
  });
  it('with a chapter filter and no query, returns all products in chapter', () => {
    expect(searchProducts(products, '', '94').map(p => p.id).sort()).toEqual(['p1', 'p3']);
  });
  it('with a chapter filter and a name query, intersects', () => {
    expect(searchProducts(products, 'chair', '94').map(p => p.id)).toEqual(['p1']);
    expect(searchProducts(products, 'chair', '61')).toEqual([]);
  });
  it('with a chapter filter and a digit query, intersects', () => {
    expect(searchProducts(products, '9404', '94').map(p => p.id).sort()).toEqual(['p1', 'p3']);
  });
});
