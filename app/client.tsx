'use client';
import { useMemo } from 'react';
import type { PlaybookData } from '@/lib/types';
import { useSelections } from '@/lib/url-state';
import { resolveFTA } from '@/lib/resolve-fta';
import { findLaneOverlay } from '@/lib/lane-overlay';
import { LaneSelector } from '@/components/lane-selector';
import { FTADetails } from '@/components/fta-details';
import { ProductLookup } from '@/components/product-lookup';
import { Playbook } from '@/components/playbook';
import { ReferenceTable } from '@/components/reference-table';
import { findFallbackFTA } from '@/lib/fallback';

export function PlaybookClient({ data }: { data: PlaybookData }) {
  const { selections, setSelections } = useSelections();
  const { origin, destination, freeZone, hsn } = selections;

  const ftaResolution = useMemo(() => {
    if (!origin || !destination) return null;
    return resolveFTA(data.ftas, origin, destination);
  }, [origin, destination, data.ftas]);

  const fta = ftaResolution?.primary ?? null;
  const alternatives = ftaResolution?.alternatives ?? [];

  const overlay = useMemo(() => {
    if (!origin || !destination) return { lane: null, freeZoneFallback: false };
    return findLaneOverlay(data.lanes, { originId: origin, destinationId: destination, isFreeZone: freeZone });
  }, [origin, destination, freeZone, data.lanes]);

  const lane = overlay.lane;
  const fallbackFTA = useMemo(() => findFallbackFTA(data.ftas), [data.ftas]);
  const originName = useMemo(
    () => origin ? data.countries.find(c => c.id === origin)?.name ?? '' : '',
    [origin, data.countries],
  );
  const destinationName = useMemo(
    () => destination ? data.countries.find(c => c.id === destination)?.name ?? '' : '',
    [destination, data.countries],
  );
  const product = useMemo(() => hsn ? data.products.find(p => p.hsnPrimary === hsn) ?? null : null, [hsn, data.products]);

  function handleLaneChange(next: { origin?: string | null; destination?: string | null; freeZone?: boolean }) {
    const laneIdentityChanged =
      ('origin' in next && next.origin !== origin) ||
      ('destination' in next && next.destination !== destination);
    setSelections({ ...next, ...(laneIdentityChanged ? { hsn: null } : {}) });
  }

  return (
    <main className="max-w-5xl mx-auto px-5 py-9 flex-1">
      <h1 className="font-heading font-light text-4xl text-navy mb-1">FTA <em className="not-italic text-orange">Eligibility</em> & COO Playbook</h1>
      <p className="text-sm text-grey mb-8 max-w-xl">Pick a trade lane, then a product, to surface the applicable FTA and the steps to claim preferential treatment.</p>

      <LaneSelector
        countries={data.countries}
        origin={origin}
        destination={destination}
        freeZone={freeZone}
        onChange={handleLaneChange}
      />

      {origin && destination && !ftaResolution && (
        <p key={`no-fta-${origin}-${destination}`} className="text-sm text-grey mb-5 px-1 animate-fade-in">No FTA configured for this lane.</p>
      )}
      {fta && (
        <div key={`fta-${fta.id}-${origin}-${destination}`} className="animate-section-in">
          <FTADetails
            fta={fta}
            lane={lane}
            alternatives={alternatives}
            originName={originName}
            destinationName={destinationName}
            freeZoneFallback={overlay.freeZoneFallback}
          />
        </div>
      )}

      {fta && (
        <div key={`lookup-${fta.id}`} className="animate-section-in">
          <ProductLookup
            products={data.products}
            chapters={data.chapters}
            selectedHsn={hsn}
            onPickHSN={(h) => setSelections({ hsn: h || null })}
            fta={fta}
            originName={originName}
            destinationName={destinationName}
          />
        </div>
      )}

      {fta && hsn && (
        <div key={`playbook-${fta.id}-${hsn}`} className="animate-section-in">
          <Playbook
            fta={fta}
            lane={lane}
            product={product}
            hsn={hsn}
            isManualEntry={!product}
            defaults={data.defaults}
            fallback={fallbackFTA}
            originName={originName}
            destinationName={destinationName}
            syncedAt={data.syncedAt}
          />
        </div>
      )}

      <ReferenceTable
        countries={data.countries}
        ftas={data.ftas}
        lanes={data.lanes}
        defaultCollapsed={!!fta}
      />
    </main>
  );
}
