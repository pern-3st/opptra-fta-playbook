'use client';
import { useMemo } from 'react';
import type { PlaybookData } from '@/lib/types';
import { useSelections } from '@/lib/url-state';
import { resolveLane } from '@/lib/resolve-lane';
import { LaneSelector } from '@/components/lane-selector';
import { FTADetails } from '@/components/fta-details';
import { ProductLookup } from '@/components/product-lookup';
import { Playbook } from '@/components/playbook';
import { ReferenceTable } from '@/components/reference-table';
import { findAlternativeFTAs } from '@/lib/alternatives';
import { findFallbackFTA } from '@/lib/fallback';

export function PlaybookClient({ data }: { data: PlaybookData }) {
  const { selections, setSelections } = useSelections();
  const { origin, destination, freeZone, hsn } = selections;

  const resolution = useMemo(() => {
    if (!origin || !destination) return null;
    return resolveLane(data.lanes, { originId: origin, destinationId: destination, isFreeZone: freeZone });
  }, [origin, destination, freeZone, data.lanes]);

  const lane = resolution?.lane ?? null;
  const fta = useMemo(() => lane?.ftaId ? data.ftas.find(f => f.id === lane.ftaId) ?? null : null, [lane, data.ftas]);
  const fallbackFTA = useMemo(() => findFallbackFTA(data.ftas), [data.ftas]);
  const alternatives = useMemo(
    () => fta && lane
      ? findAlternativeFTAs(data.ftas, lane.originId, lane.destinationId, fta.id)
      : [],
    [fta, lane, data.ftas],
  );
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
        lanes={data.lanes}
        origin={origin}
        destination={destination}
        freeZone={freeZone}
        onChange={handleLaneChange}
      />

      {origin && destination && !resolution && (
        <p key={`no-fta-${origin}-${destination}`} className="text-sm text-grey mb-5 px-1 animate-fade-in">No FTA configured for this lane.</p>
      )}
      {fta && lane && (
        <div key={`fta-${fta.id}-${lane.originId}-${lane.destinationId}`} className="animate-section-in">
          <FTADetails
            fta={fta}
            lane={lane}
            alternatives={alternatives}
            originName={originName}
            destinationName={destinationName}
            freeZoneFallback={resolution?.freeZoneFallback}
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
          />
        </div>
      )}

      {fta && lane && hsn && (
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
        defaultCollapsed={!!lane}
      />
    </main>
  );
}
