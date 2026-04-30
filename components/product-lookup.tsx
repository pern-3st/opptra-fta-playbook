'use client';
import { useMemo, useState, type KeyboardEvent } from 'react';
import type { Product, HSChapter, FTA } from '@/lib/types';
import { Card, StepHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/cn';
import {
  searchProducts,
  classifyQuery,
  searchChapters,
  highlightMatch,
  countProductsByChapter,
  countNameMatches,
  NAME_RESULT_CAP,
} from '@/lib/search';

interface Props {
  products: Product[];
  chapters: HSChapter[];
  selectedHsn: string | null;
  onPickHSN: (hsn: string) => void;
  fta: FTA;
  originName: string;
  destinationName: string;
}

type Action =
  | { kind: 'commit'; hsn: string }
  | { kind: 'filter'; code: string };

const LISTBOX_ID = 'product-lookup-listbox';

export function ProductLookup({ products, chapters, selectedHsn, onPickHSN, fta, originName, destinationName }: Props) {
  const [query, setQuery] = useState('');
  const [chapterFilter, setChapterFilter] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const chapterCounts = useMemo(() => countProductsByChapter(products), [products]);
  const results = useMemo(
    () => searchProducts(products, query, chapterFilter),
    [products, query, chapterFilter],
  );
  const nameChapterCandidates = useMemo(
    () => {
      const t = query.trim();
      if (!t || /^[\d\s.\-]+$/.test(t)) return [];
      return searchChapters(chapters, t);
    },
    [query, chapters],
  );
  const totalNameMatches = useMemo(() => {
    const t = query.trim();
    if (!t || /^[\d\s.\-]+$/.test(t)) return 0;
    const pool = chapterFilter ? products.filter(p => p.hsChapterCode === chapterFilter) : products;
    return countNameMatches(pool, t);
  }, [query, products, chapterFilter]);

  if (selectedHsn) {
    return (
      <SelectedSummary
        hsn={selectedHsn}
        product={products.find(p => p.hsnPrimary === selectedHsn) ?? null}
        chapter={chapters.find(c => c.code === selectedHsn.slice(0, 2)) ?? null}
        fta={fta}
        originName={originName}
        destinationName={destinationName}
        onChange={() => onPickHSN('')}
      />
    );
  }

  const cls = classifyQuery(query, chapters);
  const knownChapter = cls.kind === 'hsn' ? cls.knownChapter : null;
  const digits = cls.kind === 'hsn' ? cls.digits : '';
  const exactly8 = cls.kind === 'hsn' ? cls.exactly8 : false;

  const showDigitNarrow = !chapterFilter && knownChapter !== null && !exactly8;
  const showEscapeHatch = results.length === 0 && knownChapter !== null && exactly8;

  const nameChapterMatches = cls.kind === 'name'
    ? nameChapterCandidates.filter(c => c.code !== chapterFilter && !(showDigitNarrow && knownChapter && c.code === knownChapter.code))
    : [];

  const extraCount = cls.kind === 'name' && results.length >= NAME_RESULT_CAP
    ? Math.max(0, totalNameMatches - results.length)
    : 0;

  const actions: Action[] = [];
  if (showDigitNarrow && knownChapter) actions.push({ kind: 'filter', code: knownChapter.code });
  for (const c of nameChapterMatches) actions.push({ kind: 'filter', code: c.code });
  for (const p of results) actions.push({ kind: 'commit', hsn: p.hsnPrimary });
  if (showEscapeHatch) actions.push({ kind: 'commit', hsn: digits });

  const clampedActive = Math.min(activeIndex, Math.max(0, actions.length - 1));

  function performAction(a: Action) {
    if (a.kind === 'commit') onPickHSN(a.hsn);
    else setChapterFilter(a.code);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(actions.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const a = actions[clampedActive];
      if (a) performAction(a);
    } else if (e.key === 'Escape') {
      if (query) setQuery('');
      else if (chapterFilter) setChapterFilter(null);
    }
  }

  const filteredChapter = chapterFilter ? chapters.find(c => c.code === chapterFilter) ?? null : null;
  const isEmpty = query === '' && !chapterFilter;
  const filterEmptyState = !!filteredChapter && query === '';
  const filteredHasProducts = filterEmptyState && results.length > 0;
  const filteredNoProducts = filterEmptyState && results.length === 0;

  let noMatchNode: React.ReactNode = null;
  if (filteredNoProducts) {
    noMatchNode = (
      <p className="mt-3 text-sm text-grey">
        No catalogued products in Chapter {filteredChapter!.code} — {filteredChapter!.name}.
        Type the 8-digit HSN to enter it manually, or remove the filter.
      </p>
    );
  } else if (!isEmpty && results.length === 0 && nameChapterMatches.length === 0 && !showDigitNarrow && !showEscapeHatch) {
    if (cls.kind === 'hsn') {
      if (!knownChapter) {
        noMatchNode = (
          <p className="mt-3 text-sm text-grey">
            <code className="font-mono">{digits.slice(0, 2)}</code> isn&apos;t a recognised HS chapter. Check the code.
          </p>
        );
      } else if (!exactly8) {
        noMatchNode = (
          <p className="mt-3 text-sm text-grey">
            Need 8 digits to commit. You&apos;re at {digits.length}.
          </p>
        );
      }
    } else if (cls.kind === 'name') {
      noMatchNode = (
        <>
          <p className="mt-3 text-sm text-grey">No matches. Try a different word, or browse a chapter below.</p>
          <ChapterGrid chapters={chapters} counts={chapterCounts} onPick={code => setChapterFilter(code)} />
        </>
      );
    }
  } else if (!isEmpty && results.length === 0 && showDigitNarrow && !exactly8) {
    noMatchNode = (
      <p className="mt-3 text-sm text-grey">
        Need 8 digits to commit. You&apos;re at {digits.length}.
      </p>
    );
  }

  let optIdx = 0;
  const queryForHighlight = cls.kind === 'name' ? cls.name : '';

  return (
    <Card>
      <StepHeader
        num={2}
        title="Identify what you're shipping"
        subtitle="Search by product name, HSN code, or browse a chapter."
      />
      <Input
        role="combobox"
        aria-controls={LISTBOX_ID}
        aria-expanded={!isEmpty}
        aria-activedescendant={actions.length > 0 ? `pl-opt-${clampedActive}` : undefined}
        placeholder="e.g. gaming chair, or 94042900"
        value={query}
        onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
        onKeyDown={onKeyDown}
      />
      {filteredChapter && (
        <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-canvas border border-grey-light text-sm text-navy">
          <span>Chapter {filteredChapter.code} — {filteredChapter.name}</span>
          <Button
            variant="link"
            type="button"
            aria-label="Remove chapter filter"
            onClick={() => setChapterFilter(null)}
            className="text-grey hover:text-navy hover:no-underline text-base leading-none"
          >
            ✕
          </Button>
        </div>
      )}
      {filteredHasProducts && (
        <p className="mt-3 text-sm text-grey">
          Showing {results.length} {results.length === 1 ? 'product' : 'products'} in Chapter {filteredChapter!.code} — keep typing to narrow.
        </p>
      )}
      {isEmpty && <ChapterGrid chapters={chapters} counts={chapterCounts} onPick={code => setChapterFilter(code)} />}
      {!isEmpty && actions.length > 0 && (
        <ul id={LISTBOX_ID} role="listbox" className="mt-3 divide-y divide-grey-light/40">
          {showDigitNarrow && knownChapter && (
            <NarrowRow
              id={`pl-opt-${optIdx}`}
              chapter={knownChapter}
              count={chapterCounts.get(knownChapter.code) ?? 0}
              active={clampedActive === optIdx}
              onActivate={(idx => () => setActiveIndex(idx))(optIdx++)}
              onSelect={() => performAction({ kind: 'filter', code: knownChapter.code })}
            />
          )}
          {nameChapterMatches.map(c => {
            const i = optIdx++;
            return (
              <NarrowRow
                key={c.id}
                id={`pl-opt-${i}`}
                chapter={c}
                count={chapterCounts.get(c.code) ?? 0}
                active={clampedActive === i}
                onActivate={() => setActiveIndex(i)}
                onSelect={() => performAction({ kind: 'filter', code: c.code })}
              />
            );
          })}
          {results.map(p => {
            const i = optIdx++;
            return (
              <ResultRow
                key={p.id}
                id={`pl-opt-${i}`}
                product={p}
                highlightQuery={queryForHighlight}
                active={clampedActive === i}
                onActivate={() => setActiveIndex(i)}
                onSelect={() => performAction({ kind: 'commit', hsn: p.hsnPrimary })}
              />
            );
          })}
          {showEscapeHatch && knownChapter && (
            <EscapeHatchRow
              id={`pl-opt-${optIdx}`}
              hsn={digits}
              chapter={knownChapter}
              active={clampedActive === optIdx}
              onActivate={(idx => () => setActiveIndex(idx))(optIdx++)}
              onSelect={() => performAction({ kind: 'commit', hsn: digits })}
            />
          )}
        </ul>
      )}
      {extraCount > 0 && (
        <p className="mt-2 text-xs text-grey">+ {extraCount} more — narrow your search to see them.</p>
      )}
      {noMatchNode}
    </Card>
  );
}

function ChapterGrid({
  chapters, counts, onPick,
}: { chapters: HSChapter[]; counts: Map<string, number>; onPick: (code: string) => void }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {chapters.map(c => {
        const count = counts.get(c.code) ?? 0;
        const empty = count === 0;
        return (
          <Button
            key={c.id}
            variant="secondary"
            type="button"
            data-empty={empty ? 'true' : 'false'}
            aria-label={`Chapter ${c.code} — ${c.name} (${count} ${count === 1 ? 'product' : 'products'})`}
            onClick={() => onPick(c.code)}
            className={cn(
              'justify-between gap-2 font-normal text-left',
              empty
                ? 'text-grey/70 border-grey-light/60 hover:border-grey hover:bg-canvas/50'
                : 'hover:bg-canvas',
            )}
          >
            <span className="truncate">
              <span className="font-mono text-grey">{c.code}</span> · {c.name}
            </span>
            <span className={cn('text-xs font-mono shrink-0', empty ? 'text-grey/60' : 'text-grey')}>
              {count}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const segments = highlightMatch(text, query);
  return (
    <>
      {segments.map((s, i) =>
        s.match ? <mark key={i} className="bg-yellow/40 text-navy rounded-sm px-0.5">{s.text}</mark> : <span key={i}>{s.text}</span>,
      )}
    </>
  );
}

function ResultRow({
  id, product, highlightQuery, active, onActivate, onSelect,
}: {
  id: string;
  product: Product;
  highlightQuery: string;
  active: boolean;
  onActivate: () => void;
  onSelect: () => void;
}) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseEnter={onActivate}
      onClick={onSelect}
      className={`py-2.5 px-2 rounded-lg cursor-pointer ${active ? 'bg-canvas border-l-2 border-navy' : 'hover:bg-canvas border-l-2 border-transparent'}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-navy">
          <HighlightedText text={product.name} query={highlightQuery} />
        </span>
        <span className="flex items-baseline gap-3">
          <span className="text-xs font-mono text-grey">{product.hsnPrimary}</span>
          <span className={`text-xs ${active ? 'text-navy' : 'text-grey'}`}>Select →</span>
        </span>
      </div>
      {product.description && (
        <p className="text-xs text-grey mt-0.5 line-clamp-1">
          <HighlightedText text={product.description} query={highlightQuery} />
        </p>
      )}
    </li>
  );
}

function NarrowRow({
  id, chapter, count, active, onActivate, onSelect,
}: { id: string; chapter: HSChapter; count: number; active: boolean; onActivate: () => void; onSelect: () => void }) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseEnter={onActivate}
      onClick={onSelect}
      className={`py-2.5 px-2 rounded-lg cursor-pointer text-sm text-navy ${active ? 'bg-canvas' : 'hover:bg-canvas'}`}
    >
      ↳ Narrow to Chapter {chapter.code} — {chapter.name} ({count} {count === 1 ? 'product' : 'products'})
    </li>
  );
}

function EscapeHatchRow({
  id, hsn, chapter, active, onActivate, onSelect,
}: { id: string; hsn: string; chapter: HSChapter; active: boolean; onActivate: () => void; onSelect: () => void }) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseEnter={onActivate}
      onClick={onSelect}
      className={`py-2.5 px-2 rounded-lg cursor-pointer text-sm text-navy ${active ? 'bg-yellow' : 'bg-yellow/40 hover:bg-yellow'}`}
    >
      No product match.{' '}
      <strong>Use HSN <span className="font-mono">{hsn}</span> directly →</strong>{' '}
      Chapter {chapter.code} — {chapter.name}.
    </li>
  );
}

function SelectedSummary({
  hsn, product, chapter, fta, originName, destinationName, onChange,
}: {
  hsn: string;
  product: Product | null;
  chapter: HSChapter | null;
  fta: FTA;
  originName: string;
  destinationName: string;
  onChange: () => void;
}) {
  const hsType = hsTypeLabel(hsn);
  const formattedHsn = formatHsn(hsn);
  const chapterCode = chapter?.code ?? hsn.slice(0, 2);
  const trackTile = resolveTrackTile(fta, chapterCode);
  return (
    <Card>
      <StepHeader num={2} title="Identify what you're shipping" />
      <div
        aria-live="polite"
        className="rounded-xl bg-canvas px-4 py-3 flex items-center justify-between gap-3"
      >
        <div className="text-sm text-navy">
          {product ? (
            <>
              <span className="font-bold">{product.name}</span>
              {' · '}
              <span>HSN <span className="font-mono">{hsn}</span></span>
              {chapter && <> · <span>Chapter {chapter.code} — {chapter.name}</span></>}
            </>
          ) : (
            <>
              <span>HSN <span className="font-mono">{hsn}</span></span>{' '}
              <span className="text-grey">(manual entry)</span>
              {chapter && <> · <span>Chapter {chapter.code} — {chapter.name}</span></>}
            </>
          )}
        </div>
        <Button
          variant="link"
          type="button"
          onClick={onChange}
          className="text-sm shrink-0"
        >
          Change
        </Button>
      </div>

      {chapter && (
        <div className="mt-5 rounded-xl border border-black/5 bg-canvas px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-grey">
            HS Code · {hsType}
          </div>
          <h3 className="font-heading font-bold text-navy text-lg mt-1">
            Chapter {chapter.code}: {chapter.name}
          </h3>
          {chapter.description && (
            <p className="text-sm text-navy mt-1">{chapter.description}</p>
          )}
          {chapter.section && (
            <p className="text-xs text-grey mt-1.5 italic">{chapter.section}</p>
          )}
        </div>
      )}

      <div className="mt-5">
        <h4 className="font-heading font-bold text-navy mb-2">
          FTA Concession Classification — {originName} → {destinationName}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ConcessionTile
            heading={fta.shortCode || fta.name}
            track={trackTile.track}
            body={trackTile.body}
            tone={trackTile.tone}
          />
          <ConcessionTile
            heading="MFN Benchmark"
            track="WTO MFN Rate"
            body="Always compare the FTA preferential rate against the MFN rate. If MFN rate is already 0% (common for Singapore, HK, UAE), FTA may offer no additional duty benefit."
          />
          <ConcessionTile
            heading="HS Code Precision"
            track={`Entered: ${formattedHsn}`}
            body="FTA concessions are applied at the 6-digit or 8-digit tariff line level. Obtain the country-specific HS code (tariff line) to determine the exact applicable rate."
          />
        </div>
      </div>
    </Card>
  );
}

type TileTone = 'neutral' | 'normal' | 'sensitive' | 'excluded';

function ConcessionTile({ heading, track, body, tone = 'neutral' }: { heading: string; track: string; body: string; tone?: TileTone }) {
  const toneStyles: Record<TileTone, { container: string; track: string }> = {
    neutral:   { container: 'bg-white border-black/5',         track: 'text-navy' },
    normal:    { container: 'bg-white border-orange/30',       track: 'text-orange' },
    sensitive: { container: 'bg-yellow border-orange/40',      track: 'text-orange' },
    excluded:  { container: 'bg-orange/10 border-orange/60',   track: 'text-orange' },
  };
  const s = toneStyles[tone];
  return (
    <div className={cn('rounded-xl border p-4', s.container)}>
      <div className="text-xs font-semibold uppercase tracking-wider text-orange">{heading}</div>
      <div className={cn('text-sm font-bold mt-1', s.track)}>{track}</div>
      <p className="text-xs text-grey mt-1.5 leading-relaxed">{body}</p>
    </div>
  );
}

function hsTypeLabel(hsn: string): string {
  if (hsn.length >= 8) return 'Subheading (8-digit)';
  if (hsn.length >= 6) return 'Subheading (6-digit)';
  if (hsn.length >= 4) return 'Heading (4-digit)';
  return 'Chapter (2-digit)';
}

function formatHsn(hsn: string): string {
  return hsn.replace(/(.{2})(?=.)/g, '$1 ').trim();
}

function resolveTrackTile(fta: FTA, chapterCode: string): { track: string; body: string; tone: TileTone } {
  const { sensitive, excluded } = fta.body.chapterClassifications;
  const hasData = sensitive.length > 0 || excluded.length > 0;
  if (!hasData) {
    return {
      track: 'Verify in Official Schedule',
      body: `Consult the official FTA tariff schedule for the specific concession applicable to Chapter ${chapterCode} under ${fta.name}.`,
      tone: 'neutral',
    };
  }
  if (excluded.includes(chapterCode)) {
    return {
      track: '⛔ Exclusion List',
      body: `This chapter is on the Exclusion List under ${fta.name}. MFN rates apply — no preferential tariff available.`,
      tone: 'excluded',
    };
  }
  if (sensitive.includes(chapterCode)) {
    return {
      track: '⚠ Sensitive / Restricted Track',
      body: `This chapter is classified as Sensitive under ${fta.name}. Concessions are limited — rates may not reach 0%. Verify the specific tariff line in the official FTA schedule.`,
      tone: 'sensitive',
    };
  }
  return {
    track: '✓ Normal Track — Eligible for Concession',
    body: `This chapter is on the Normal Track under ${fta.name}. Verify the exact preferential rate at the 8-digit tariff line in the official schedule.`,
    tone: 'normal',
  };
}
