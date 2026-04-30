// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Playbook } from '@/components/playbook';
import type { FTA, Lane, Product, ComplianceDefaults } from '@/lib/types';

// MICECA-shaped FTA: no validity/claim/retention populated
const fta: FTA = {
  id: 'M', name: 'MICECA', shortCode: 'MICECA', fullName: 'Malaysia-India CECA',
  status: 'Active', statusLabel: 'Active', inForce: '', coverage: '',
  tariffFramework: '', cooForm: 'MICECA Certificate of Origin', roo: '35% RVC or CTC',
  validity: '', claimWindow: '', retention: '', description: '',
  priority: 5, memberCountryIds: ['IN', 'MY'],
  body: { description: '', tracks: '', chapterNotes: '', extras: '- Verify ADD/CVD on the HS line.', resources: '' },
};

const fallback: FTA = {
  ...fta,
  id: 'NONE', name: 'No FTA', shortCode: '—',
  cooForm: 'Standard commercial invoice (no preferential COO).',
  validity: 'Non-preferential COO validity per issuing Chamber (typically 6–12 months)',
  claimWindow: 'WTO MFN rates apply on import',
  retention: 'Per destination-country customs law (typically 5 years…)',
  body: { description: '', tracks: '', chapterNotes: '', extras: '', resources: '' },
};

const lane: Lane = { id: 'L', originId: 'IN', destinationId: 'MY', ftaId: 'M', isFreeZone: false, cooForm: '', notes: '' };
const laneWithCooOverride: Lane = { ...lane, cooForm: 'Lane-specific COO addendum required' };
const product: Product = { id: 'P', name: 'gaming chair', hsnPrimary: '94013000', hsnAlternates: [], description: '', hsChapterCode: '94' };
const defaults: ComplianceDefaults = { documentRequirements: '- Commercial Invoice', claimConditions: '- RoO satisfied' };

describe('Playbook', () => {
  it('renders Documents and Conditions expanded — no <details> wrapping the standard claim conditions', () => {
    render(
      <Playbook fta={fta} lane={lane} product={product} defaults={defaults}
                fallback={fallback} originName="India" destinationName="Malaysia"
                syncedAt="2026-04-30T00:00:00.000Z" />,
    );
    expect(screen.getByText(/Documents to be furnished/i)).toBeTruthy();
    expect(screen.getByText(/Conditions to be met/i)).toBeTruthy();
    expect(screen.queryByText(/Standard claim conditions/i)).toBeNull();
  });

  it('uses NONE-fallback values when FTA fields are empty', () => {
    render(
      <Playbook fta={fta} lane={lane} product={product} defaults={defaults}
                fallback={fallback} originName="India" destinationName="Malaysia"
                syncedAt="2026-04-30T00:00:00.000Z" />,
    );
    expect(screen.getByText(/MICECA — specifics for this lane/i)).toBeTruthy();
    expect(screen.getByText(/WTO MFN rates apply on import/i)).toBeTruthy();
    expect(screen.getByText(/typically 6–12 months/i)).toBeTruthy();
  });

  it('prefers lane.cooForm over the resolved FTA cooForm when set', () => {
    render(
      <Playbook fta={fta} lane={laneWithCooOverride} product={product} defaults={defaults}
                fallback={fallback} originName="India" destinationName="Malaysia"
                syncedAt="2026-04-30T00:00:00.000Z" />,
    );
    expect(screen.getByText(/Lane-specific COO addendum required/i)).toBeTruthy();
    expect(screen.queryByText(/MICECA Certificate of Origin/i)).toBeNull();
  });

  it('inlines body.extras as bullet items in the specifics list', () => {
    render(
      <Playbook fta={fta} lane={lane} product={product} defaults={defaults}
                fallback={fallback} originName="India" destinationName="Malaysia"
                syncedAt="2026-04-30T00:00:00.000Z" />,
    );
    expect(screen.getByText(/Verify ADD\/CVD on the HS line/i)).toBeTruthy();
  });

  it('renders the Indicative guidance only footer', () => {
    render(
      <Playbook fta={fta} lane={lane} product={product} defaults={defaults}
                fallback={fallback} originName="India" destinationName="Malaysia"
                syncedAt="2026-04-30T00:00:00.000Z" />,
    );
    expect(screen.getByText(/Indicative guidance only/i)).toBeTruthy();
  });

  it('renders with product=null and isManualEntry, showing the manual-entry note and HSN', () => {
    render(
      <Playbook fta={fta} lane={lane} product={null} hsn="94999999" isManualEntry
                defaults={defaults} fallback={fallback}
                originName="India" destinationName="Malaysia"
                syncedAt="2026-04-30T00:00:00.000Z" />,
    );
    expect(screen.getByText(/Manual-entry tariff line/i)).toBeTruthy();
    expect(screen.getByText(/94999999/)).toBeTruthy();
  });
});
