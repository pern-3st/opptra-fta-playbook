import type { HSChapter, Product } from './types';

const NAME_MAX = 10;
const HSN_MAX = 20;

export type QueryClassification =
  | { kind: 'empty' }
  | { kind: 'name'; name: string }
  | { kind: 'hsn'; digits: string; knownChapter: HSChapter | null; exactly8: boolean };

const DIGIT_LIKE = /^[\d\s.\-]+$/;

export function classifyQuery(input: string, chapters: HSChapter[]): QueryClassification {
  const trimmed = input.trim();
  if (!trimmed) return { kind: 'empty' };
  if (!DIGIT_LIKE.test(trimmed)) return { kind: 'name', name: trimmed };
  const digits = normalizeHSN(trimmed);
  if (!digits) return { kind: 'empty' };
  const prefix = digits.slice(0, 2);
  const knownChapter = chapters.find(c => c.code === prefix) ?? null;
  return { kind: 'hsn', digits, knownChapter, exactly8: digits.length === 8 };
}

export function searchProducts(products: Product[], query: string, chapterFilter: string | null): Product[] {
  const trimmed = query.trim();
  const inChapter = chapterFilter
    ? (p: Product) => p.hsChapterCode === chapterFilter
    : () => true;
  if (!trimmed) {
    return chapterFilter ? products.filter(inChapter).slice(0, HSN_MAX) : [];
  }
  const isDigits = DIGIT_LIKE.test(trimmed);
  if (isDigits) return searchProductsByHSN(products, trimmed).filter(inChapter);
  return searchProductsByName(products, trimmed).filter(inChapter);
}

export function searchProductsByName(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: Product[] = [];
  for (const p of products) {
    if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
      out.push(p);
      if (out.length >= NAME_MAX) break;
    }
  }
  return out;
}

export function normalizeHSN(input: string): string {
  return input.replace(/\D/g, '');
}

export function searchProductsByHSN(products: Product[], query: string): Product[] {
  const q = normalizeHSN(query);
  if (!q) return [];
  const out: Product[] = [];
  for (const p of products) {
    const match = q.length === 2
      ? p.hsChapterCode === q
      : p.hsnPrimary.startsWith(q) || p.hsnAlternates.some(alt => alt.startsWith(q));
    if (match) {
      out.push(p);
      if (out.length >= HSN_MAX) break;
    }
  }
  return out;
}
