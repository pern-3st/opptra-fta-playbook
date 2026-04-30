// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FTADetails } from '@/components/fta-details';
import type { FTA, Lane } from '@/lib/types';

const fta: FTA = {
  id: 'M', name: 'MICECA', shortCode: 'MICECA', fullName: 'Malaysia-India CECA (MICECA)',
  status: 'Active', statusLabel: 'Active', inForce: 'In force since 1 July 2011',
  coverage: 'India and Malaysia (bilateral)',
  tariffFramework: 'Provides deeper tariff concessions than AIFTA.',
  cooForm: 'MICECA Certificate of Origin',
  roo: '35% RVC or CTC',
  validity: '', claimWindow: '', retention: '', description: 'MICECA provides bilateral preferences…',
  priority: 5, memberCountryIds: ['IN', 'MY'],
  body: {
    description: 'MICECA provides bilateral preferences…',
    tracks: '- Normal Track: 0% phased over 2011–2016\n- Sensitive List: 5% ceiling\n- Exclusion: MFN rates apply',
    chapterNotes: '', extras: '', resources: '',
  },
};

const lane: Lane = { id: 'L', originId: 'IN', destinationId: 'MY', ftaId: 'M', isFreeZone: false, cooForm: '', notes: '' };

const aifta: FTA = { ...fta, id: 'A', name: 'AIFTA', shortCode: 'AIFTA', fullName: 'ASEAN-India FTA' };

describe('FTADetails', () => {
  it('renders track tiles parsed from body.tracks', () => {
    render(<FTADetails fta={fta} lane={lane} alternatives={[]} originName="India" destinationName="Malaysia" />);
    expect(screen.getByText(/Tariff Concession Framework/i)).toBeTruthy();
    expect(screen.getByText('Normal Track')).toBeTruthy();
    expect(screen.getByText('0% phased over 2011–2016')).toBeTruthy();
    expect(screen.getByText('Sensitive List')).toBeTruthy();
    expect(screen.getByText('Exclusion')).toBeTruthy();
  });

  it('falls back to a single tile rendering tariffFramework when body.tracks is empty', () => {
    const sparse = { ...fta, body: { ...fta.body, tracks: '' } };
    render(<FTADetails fta={sparse} lane={lane} alternatives={[]} originName="India" destinationName="Malaysia" />);
    expect(screen.getByText(/Provides deeper tariff concessions than AIFTA/i)).toBeTruthy();
  });

  it('renders the alternatives panel when alternatives are present', () => {
    render(<FTADetails fta={fta} lane={lane} alternatives={[aifta]} originName="India" destinationName="Malaysia" />);
    expect(screen.getByText(/Other agreements covering India → Malaysia/i)).toBeTruthy();
    expect(screen.getByText(/AIFTA/)).toBeTruthy();
  });

  it('omits the alternatives panel when there are none', () => {
    render(<FTADetails fta={fta} lane={lane} alternatives={[]} originName="India" destinationName="Malaysia" />);
    expect(screen.queryByText(/Other agreements covering/i)).toBeNull();
  });

  it('shows COO Form and RoO on the FTA card (in addition to the Playbook)', () => {
    render(<FTADetails fta={fta} lane={lane} alternatives={[]} originName="India" destinationName="Malaysia" />);
    expect(screen.getByText(/MICECA Certificate of Origin/i)).toBeTruthy();
    expect(screen.getByText(/35% RVC or CTC/i)).toBeTruthy();
  });
});
