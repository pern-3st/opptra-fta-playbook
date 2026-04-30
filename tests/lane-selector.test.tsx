// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LaneSelector } from '@/components/lane-selector';
import type { Country } from '@/lib/types';

const C = (
  id: string,
  name: string,
  region: string | null = 'X',
  regionSeq: number | null = 1,
  countrySeq: number | null = 1,
): Country => ({ id, name, region, regionSeq, countrySeq, notes: '' });

describe('LaneSelector', () => {
  it('shows all countries in destination regardless of lane configuration', () => {
    const countries = [C('a', 'Atlantis'), C('b', 'Borduria'), C('c', 'Cathay')];
    render(
      <LaneSelector countries={countries}
        origin="a" destination={null} freeZone={false} onChange={vi.fn()} />,
    );
    const dest = screen.getByRole('combobox', { name: 'Destination' });
    fireEvent.focus(dest);
    const opts = screen.getAllByRole('option').map(o => o.textContent);
    expect(opts).toContain('Borduria');
    expect(opts).toContain('Cathay');
    expect(opts).not.toContain('Atlantis');
  });

  it('groups countries by region in dropdown order', () => {
    const countries = [
      C('in', 'India', 'South Asia', 1, 1),
      C('bd', 'Bangladesh', 'South Asia', 1, 2),
      C('sg', 'Singapore', 'ASEAN', 2, 1),
      C('th', 'Thailand', 'ASEAN', 2, 2),
    ];
    render(
      <LaneSelector countries={countries}
        origin={null} destination={null} freeZone={false} onChange={vi.fn()} />,
    );
    const origin = screen.getByRole('combobox', { name: 'Origin' });
    fireEvent.focus(origin);
    expect(screen.getByText('South Asia')).toBeInTheDocument();
    expect(screen.getByText('ASEAN')).toBeInTheDocument();
    const groups = screen.getAllByRole('group').map(g => g.getAttribute('aria-labelledby'));
    expect(groups).toHaveLength(2);
  });

  it('filters by typing across all regions', () => {
    const countries = [
      C('in', 'India', 'South Asia', 1, 1),
      C('id', 'Indonesia', 'ASEAN', 2, 1),
      C('th', 'Thailand', 'ASEAN', 2, 2),
    ];
    render(
      <LaneSelector countries={countries}
        origin={null} destination={null} freeZone={false} onChange={vi.fn()} />,
    );
    const origin = screen.getByRole('combobox', { name: 'Origin' });
    fireEvent.focus(origin);
    fireEvent.change(origin, { target: { value: 'ind' } });
    const opts = screen.getAllByRole('option').map(o => o.textContent);
    expect(opts).toContain('India');
    expect(opts).toContain('Indonesia');
    expect(opts).not.toContain('Thailand');
  });

  it('commits a selection on click', () => {
    const onChange = vi.fn();
    const countries = [C('a', 'Atlantis'), C('b', 'Borduria')];
    render(
      <LaneSelector countries={countries}
        origin={null} destination={null} freeZone={false} onChange={onChange} />,
    );
    const origin = screen.getByRole('combobox', { name: 'Origin' });
    fireEvent.focus(origin);
    const option = screen.getByRole('option', { name: 'Borduria' });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith({ origin: 'b', destination: null });
  });
});
