'use client';
import { useMemo, useState, type KeyboardEvent } from 'react';
import type { Product, HSChapter } from '@/lib/types';
import { Card, StepHeader } from './ui/card';
import { Input } from './ui/input';
import { searchProducts, classifyQuery } from '@/lib/search';

interface Props {
  products: Product[];
  chapters: HSChapter[];
  selectedHsn: string | null;
  onPickHSN: (hsn: string) => void;
}

type Action =
  | { kind: 'commit'; hsn: string }
  | { kind: 'filter'; code: string };

const LISTBOX_ID = 'product-lookup-listbox';

export function ProductLookup({ products, chapters, selectedHsn, onPickHSN }: Props) {
  const [query, setQuery] = useState('');
  const [chapterFilter, setChapterFilter] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cls = classifyQuery(query, chapters);
  const results = useMemo(
    () => searchProducts(products, query, chapterFilter),
    [products, query, chapterFilter],
  );

  if (selectedHsn) {
    return (
      <SelectedSummary
        hsn={selectedHsn}
        product={products.find(p => p.hsnPrimary === selectedHsn) ?? null}
        chapter={chapters.find(c => c.code === selectedHsn.slice(0, 2)) ?? null}
        onChange={() => onPickHSN('')}
      />
    );
  }

  const knownChapter = cls.kind === 'hsn' ? cls.knownChapter : null;
  const digits = cls.kind === 'hsn' ? cls.digits : '';
  const exactly8 = cls.kind === 'hsn' ? cls.exactly8 : false;

  const showNarrow = !chapterFilter && knownChapter !== null && !exactly8;
  const showEscapeHatch = results.length === 0 && knownChapter !== null && exactly8;

  const actions: Action[] = [];
  if (showNarrow && knownChapter) actions.push({ kind: 'filter', code: knownChapter.code });
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

  let noMatchNode: React.ReactNode = null;
  if (!isEmpty && results.length === 0 && !showNarrow && !showEscapeHatch) {
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
          <ChapterGrid chapters={chapters} onPick={code => setChapterFilter(code)} />
        </>
      );
    }
  } else if (!isEmpty && results.length === 0 && showNarrow && !exactly8) {
    noMatchNode = (
      <p className="mt-3 text-sm text-grey">
        Need 8 digits to commit. You&apos;re at {digits.length}.
      </p>
    );
  }

  let optIdx = 0;

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
          <button
            type="button"
            aria-label="Remove chapter filter"
            onClick={() => setChapterFilter(null)}
            className="text-grey hover:text-navy text-base leading-none"
          >
            ✕
          </button>
        </div>
      )}
      {isEmpty && <ChapterGrid chapters={chapters} onPick={code => setChapterFilter(code)} />}
      {!isEmpty && actions.length > 0 && (
        <ul id={LISTBOX_ID} role="listbox" className="mt-3 divide-y divide-grey-light/40">
          {showNarrow && knownChapter && (
            <NarrowRow
              id={`pl-opt-${optIdx}`}
              chapter={knownChapter}
              count={products.filter(p => p.hsChapterCode === knownChapter.code).length}
              active={clampedActive === optIdx}
              onActivate={(idx => () => setActiveIndex(idx))(optIdx++)}
              onSelect={() => performAction({ kind: 'filter', code: knownChapter.code })}
            />
          )}
          {results.map(p => {
            const i = optIdx++;
            return (
              <ResultRow
                key={p.id}
                id={`pl-opt-${i}`}
                product={p}
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
      {noMatchNode}
    </Card>
  );
}

function ChapterGrid({ chapters, onPick }: { chapters: HSChapter[]; onPick: (code: string) => void }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {chapters.map(c => (
        <button
          key={c.id}
          type="button"
          aria-pressed={false}
          onClick={() => onPick(c.code)}
          className="text-left text-sm text-navy px-3 py-2 rounded border border-grey-light hover:border-orange hover:bg-canvas transition-colors"
        >
          <span className="font-mono text-grey">{c.code}</span> · {c.name}
        </button>
      ))}
    </div>
  );
}

function ResultRow({
  id, product, active, onActivate, onSelect,
}: { id: string; product: Product; active: boolean; onActivate: () => void; onSelect: () => void }) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseEnter={onActivate}
      onClick={onSelect}
      className={`py-2.5 px-2 rounded cursor-pointer ${active ? 'bg-canvas border-l-2 border-navy' : 'hover:bg-canvas border-l-2 border-transparent'}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-navy">{product.name}</span>
        <span className="flex items-baseline gap-3">
          <span className="text-xs font-mono text-grey">{product.hsnPrimary}</span>
          <span className={`text-xs ${active ? 'text-navy' : 'text-grey'}`}>Select →</span>
        </span>
      </div>
      {product.description && (
        <p className="text-xs text-grey mt-0.5 line-clamp-1">{product.description}</p>
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
      className={`py-2.5 px-2 rounded cursor-pointer text-sm text-navy ${active ? 'bg-canvas' : 'hover:bg-canvas'}`}
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
      className={`py-2.5 px-2 rounded cursor-pointer text-sm text-navy ${active ? 'bg-yellow' : 'bg-yellow/40 hover:bg-yellow'}`}
    >
      No product match.{' '}
      <strong>Use HSN <span className="font-mono">{hsn}</span> directly →</strong>{' '}
      Chapter {chapter.code} — {chapter.name}.
    </li>
  );
}

function SelectedSummary({
  hsn, product, chapter, onChange,
}: { hsn: string; product: Product | null; chapter: HSChapter | null; onChange: () => void }) {
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
        <button
          type="button"
          onClick={onChange}
          className="text-sm text-orange hover:underline shrink-0"
        >
          Change
        </button>
      </div>
    </Card>
  );
}
