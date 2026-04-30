import type { HSChapter, Product } from './types';

const NAME_MAX = 10;
const HSN_MAX = 20;
const CHAPTER_MAX = 5;

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

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function scoreNameMatch(product: Product, queryTokens: string[]): number {
  const haystackName = product.name.toLowerCase();
  const haystackDesc = product.description.toLowerCase();
  let nameHits = 0;
  let descHits = 0;
  for (const t of queryTokens) {
    if (haystackName.includes(t)) nameHits++;
    else if (haystackDesc.includes(t)) descHits++;
  }
  if (nameHits === 0 && descHits === 0) return 0;
  return nameHits * 10 + descHits;
}

function searchByName(products: Product[], query: string): Product[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const scored: { p: Product; score: number }[] = [];
  for (const p of products) {
    const score = scoreNameMatch(p, tokens);
    if (score > 0) scored.push({ p, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, NAME_MAX).map(s => s.p);
}

function depluralize(word: string): string[] {
  if (word.length <= 3) return [];
  const lower = word.toLowerCase();
  const candidates: string[] = [];
  if (lower.endsWith('ies')) candidates.push(word.slice(0, -3) + 'y');
  if (lower.endsWith('es')) candidates.push(word.slice(0, -2));
  if (lower.endsWith('s')) candidates.push(word.slice(0, -1));
  return candidates;
}

export function searchProductsByName(products: Product[], query: string): Product[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const direct = searchByName(products, trimmed);
  if (direct.length > 0) return direct;
  for (const candidate of depluralize(trimmed)) {
    const r = searchByName(products, candidate);
    if (r.length > 0) return r;
  }
  return [];
}

export function countNameMatches(products: Product[], query: string): number {
  const trimmed = query.trim();
  if (!trimmed) return 0;
  const candidates = [trimmed, ...depluralize(trimmed)];
  for (const candidate of candidates) {
    const tokens = tokenize(candidate);
    if (tokens.length === 0) continue;
    let n = 0;
    for (const p of products) if (scoreNameMatch(p, tokens) > 0) n++;
    if (n > 0) return n;
  }
  return 0;
}

export function searchChapters(chapters: HSChapter[], query: string): HSChapter[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (DIGIT_LIKE.test(trimmed)) return [];
  const q = trimmed.toLowerCase();
  const out: HSChapter[] = [];
  for (const c of chapters) {
    if (c.name.toLowerCase().includes(q)) {
      out.push(c);
      if (out.length >= CHAPTER_MAX) break;
    }
  }
  return out;
}

export type HighlightSegment = { text: string; match: boolean };

export function highlightMatch(text: string, query: string): HighlightSegment[] {
  const trimmed = query.trim();
  if (!trimmed) return [{ text, match: false }];
  const haystack = text.toLowerCase();
  const needle = trimmed.toLowerCase();
  const idx = haystack.indexOf(needle);
  if (idx < 0) return [{ text, match: false }];
  const segments: HighlightSegment[] = [];
  if (idx > 0) segments.push({ text: text.slice(0, idx), match: false });
  segments.push({ text: text.slice(idx, idx + needle.length), match: true });
  if (idx + needle.length < text.length) {
    segments.push({ text: text.slice(idx + needle.length), match: false });
  }
  return segments;
}

export function countProductsByChapter(products: Product[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of products) {
    counts.set(p.hsChapterCode, (counts.get(p.hsChapterCode) ?? 0) + 1);
  }
  return counts;
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

export const NAME_RESULT_CAP = NAME_MAX;
