// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductLookup } from '@/components/product-lookup';
import type { Product, HSChapter, FTA } from '@/lib/types';

const fta: FTA = {
  id: 'fta1', name: 'AIFTA', shortCode: 'AIFTA', fullName: 'ASEAN-India Free Trade Area',
  status: 'Active', statusLabel: 'Active', inForce: '', coverage: '', tariffFramework: '',
  cooForm: '', roo: '', validity: '', claimWindow: '', retention: '', description: '',
  priority: null, memberCountryIds: [], partnerCountryIds: [],
  body: { description: '', tracks: '', chapterNotes: '', extras: '', resources: '', chapterClassifications: { sensitive: [], excluded: [] } },
};

const chapters: HSChapter[] = [
  { id: 'c94', code: '94', name: 'Furniture', description: 'Furniture; bedding, mattresses; lamps and lighting fittings', section: 'Section XX — Miscellaneous manufactured articles', notes: '' },
  { id: 'c84', code: '84', name: 'Machinery', description: '', section: '', notes: '' },
  { id: 'c61', code: '61', name: 'Apparel — knit', description: '', section: '', notes: '' },
];

const products: Product[] = [
  { id: 'p1', name: 'Gaming chair', hsnPrimary: '94013000', hsnAlternates: [], description: 'Office task chairs', hsChapterCode: '94' },
  { id: 'p2', name: 'Mattress', hsnPrimary: '94042100', hsnAlternates: [], description: 'Foam mattress', hsChapterCode: '94' },
  { id: 'p3', name: 'Cotton t-shirt', hsnPrimary: '61091000', hsnAlternates: [], description: '', hsChapterCode: '61' },
];

function renderLookup(overrides: Partial<React.ComponentProps<typeof ProductLookup>> = {}) {
  const props = {
    products,
    chapters,
    selectedHsn: null,
    onPickHSN: () => {},
    fta,
    originName: 'India',
    destinationName: 'Bangladesh',
    ...overrides,
  };
  return render(<ProductLookup {...props} />);
}

describe('ProductLookup — empty state', () => {
  it('shows the chapter grid when query and selection are empty', () => {
    renderLookup();
    expect(screen.getByRole('button', { name: /94.*Furniture/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /84.*Machinery/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /61.*Apparel/i })).toBeInTheDocument();
  });
  it('does not commit when a chapter chip is clicked; transitions to filtered state', () => {
    const onPick = vi.fn();
    renderLookup({ onPickHSN: onPick });
    fireEvent.click(screen.getByRole('button', { name: /94.*Furniture/i }));
    expect(onPick).not.toHaveBeenCalled();
    expect(screen.getByText(/Chapter 94 — Furniture/)).toBeInTheDocument();
  });
});

describe('ProductLookup — searching state', () => {
  it('renders result rows with name, HSN, Select affordance, and description', () => {
    renderLookup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'chair' } });
    const option = screen.getAllByRole('option').find(o => o.textContent?.includes('Gaming chair'))!;
    expect(option).toBeDefined();
    expect(option.textContent).toContain('Gaming chair');
    expect(option.textContent).toContain('94013000');
    expect(option.textContent).toContain('Select →');
    expect(option.textContent).toContain('Office task chairs');
  });
  it('clicking a row commits via onPickHSN with hsnPrimary', () => {
    const onPick = vi.fn();
    renderLookup({ onPickHSN: onPick });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'chair' } });
    const option = screen.getAllByRole('option').find(o => o.textContent?.includes('Gaming chair'))!;
    fireEvent.click(option);
    expect(onPick).toHaveBeenCalledWith('94013000');
  });
  it('uses listbox/option roles', () => {
    renderLookup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'chair' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
  });
});

describe('ProductLookup — filter mechanics', () => {
  it('shows a narrow-to-chapter row at the top of digit-query results', () => {
    renderLookup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '94' } });
    expect(screen.getByRole('option', { name: /Narrow to Chapter 94 — Furniture/i })).toBeInTheDocument();
  });
  it('clicking the narrow-to-chapter row sets the filter, does not commit', () => {
    const onPick = vi.fn();
    renderLookup({ onPickHSN: onPick });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '94' } });
    fireEvent.click(screen.getByRole('option', { name: /Narrow to Chapter 94/i }));
    expect(onPick).not.toHaveBeenCalled();
    expect(screen.getByText(/Chapter 94 — Furniture/)).toBeInTheDocument();
  });
  it('filter chip persists across keystrokes; only its ✕ removes it', () => {
    renderLookup();
    fireEvent.click(screen.getByRole('button', { name: /94.*Furniture/i }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'chair' } });
    expect(screen.getByText(/Chapter 94 — Furniture/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
    expect(screen.getByText(/Chapter 94 — Furniture/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Remove chapter filter/i }));
    expect(screen.queryByText(/Chapter 94 — Furniture/)).not.toBeInTheDocument();
  });
});

describe('ProductLookup — no-match', () => {
  it('offers escape-hatch commit when query is exactly 8 digits with known chapter and no product matches', () => {
    const onPick = vi.fn();
    renderLookup({ onPickHSN: onPick });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '94999999' } });
    const row = screen.getByRole('option', { name: /Use HSN 94999999 directly/i });
    fireEvent.click(row);
    expect(onPick).toHaveBeenCalledWith('94999999');
  });
  it('shows "Need 8 digits" for known chapter with <8 digits and no product matches', () => {
    renderLookup({ products: [] });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '9499' } });
    expect(screen.getByText(/Need 8 digits to commit\. You're at 4\./i)).toBeInTheDocument();
  });
  it('shows unknown-chapter message for prefix not in chapters', () => {
    renderLookup({ products: [] });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '99' } });
    expect(screen.getByText(/isn't a recognised HS chapter/i)).toBeInTheDocument();
  });
  it('shows the chapter grid again for a name query with no matches', () => {
    renderLookup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'sumthingweird' } });
    expect(screen.getByText(/No matches/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /94.*Furniture/i })).toBeInTheDocument();
  });
});

describe('ProductLookup — selected state', () => {
  it('renders the product-pick summary when selectedHsn matches a product', () => {
    renderLookup({ selectedHsn: '94013000' });
    expect(screen.getByText(/Gaming chair/)).toBeInTheDocument();
    expect(screen.getByText(/94013000/)).toBeInTheDocument();
    expect(screen.getByText(/Chapter 94 — Furniture/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
  it('renders the manual-entry summary when selectedHsn has no product match', () => {
    renderLookup({ selectedHsn: '94999999' });
    expect(screen.getByText(/manual entry/i)).toBeInTheDocument();
    expect(screen.getByText(/94999999/)).toBeInTheDocument();
  });
  it('Change reveals the search again', () => {
    const onPick = vi.fn();
    renderLookup({ selectedHsn: '94013000', onPickHSN: onPick });
    fireEvent.click(screen.getByRole('button', { name: /Change/i }));
    expect(onPick).toHaveBeenCalledWith('');
  });
  it('summary card is in an aria-live region', () => {
    const { container } = renderLookup({ selectedHsn: '94013000' });
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });
});

describe('ProductLookup — concession track tile', () => {
  it('shows "Verify in Official Schedule" when no chapter classifications are configured', () => {
    renderLookup({ selectedHsn: '94013000' });
    expect(screen.getByText(/Verify in Official Schedule/i)).toBeInTheDocument();
  });

  it('shows the Exclusion tile when the chapter is on the excluded list', () => {
    const exclFta: FTA = { ...fta, body: { ...fta.body, chapterClassifications: { sensitive: [], excluded: ['94'] } } };
    renderLookup({ selectedHsn: '94013000', fta: exclFta });
    expect(screen.getByText(/⛔ Exclusion List/)).toBeInTheDocument();
    expect(screen.getByText(/MFN rates apply/i)).toBeInTheDocument();
  });

  it('shows the Sensitive tile when the chapter is on the sensitive list', () => {
    const sensFta: FTA = { ...fta, body: { ...fta.body, chapterClassifications: { sensitive: ['94'], excluded: [] } } };
    renderLookup({ selectedHsn: '94013000', fta: sensFta });
    expect(screen.getByText(/Sensitive \/ Restricted Track/i)).toBeInTheDocument();
  });

  it('shows the Normal Track tile when classifications exist but the chapter is in neither list', () => {
    const normFta: FTA = { ...fta, body: { ...fta.body, chapterClassifications: { sensitive: ['10'], excluded: ['93'] } } };
    renderLookup({ selectedHsn: '94013000', fta: normFta });
    expect(screen.getByText(/Normal Track — Eligible for Concession/i)).toBeInTheDocument();
  });
});

describe('ProductLookup — chapter-name autocomplete', () => {
  it('surfaces a Narrow-to-Chapter row when the name query matches a chapter name', () => {
    renderLookup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'furniture' } });
    expect(screen.getByRole('option', { name: /Narrow to Chapter 94 — Furniture/i })).toBeInTheDocument();
  });
  it('clicking a chapter-name match sets the filter, does not commit', () => {
    const onPick = vi.fn();
    renderLookup({ onPickHSN: onPick });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'furniture' } });
    fireEvent.click(screen.getByRole('option', { name: /Narrow to Chapter 94 — Furniture/i }));
    expect(onPick).not.toHaveBeenCalled();
    expect(screen.getByText(/Chapter 94 — Furniture/)).toBeInTheDocument();
  });
  it('does not duplicate a chapter row when its filter is already active', () => {
    renderLookup();
    fireEvent.click(screen.getByRole('button', { name: /94.*Furniture/i }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'furniture' } });
    expect(screen.queryByRole('option', { name: /Narrow to Chapter 94 — Furniture/i })).not.toBeInTheDocument();
  });
});

describe('ProductLookup — filtered-chapter messages', () => {
  it('shows a "keep typing to narrow" hint when filter is set and products exist', () => {
    renderLookup();
    fireEvent.click(screen.getByRole('button', { name: /94.*Furniture/i }));
    expect(screen.getByText(/Showing 2 products in Chapter 94/i)).toBeInTheDocument();
    expect(screen.getByText(/keep typing to narrow/i)).toBeInTheDocument();
  });
  it('shows an empty-chapter message when filter is set and no products exist', () => {
    const sparse: HSChapter[] = [...chapters, { id: 'c05', code: '05', name: 'Other Animal Products', description: '', section: '', notes: '' }];
    renderLookup({ chapters: sparse });
    fireEvent.click(screen.getByRole('button', { name: /05.*Animal/i }));
    expect(screen.getByText(/No catalogued products in Chapter 05/i)).toBeInTheDocument();
    expect(screen.getByText(/8.?digit HSN/i)).toBeInTheDocument();
  });
});

describe('ProductLookup — chapter grid populations', () => {
  it('renders a count badge on each chapter chip', () => {
    renderLookup();
    expect(screen.getByRole('button', { name: /94.*Furniture.*\b2\b/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /84.*Machinery.*\b0\b/ })).toBeInTheDocument();
  });
  it('marks empty chapters with data-empty="true"', () => {
    renderLookup();
    const empty = screen.getByRole('button', { name: /84.*Machinery/i });
    const populated = screen.getByRole('button', { name: /94.*Furniture/i });
    expect(empty.getAttribute('data-empty')).toBe('true');
    expect(populated.getAttribute('data-empty')).toBe('false');
  });
});

describe('ProductLookup — match highlighting', () => {
  it('wraps the matched substring of a product name in a <mark>', () => {
    renderLookup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'chair' } });
    const marks = screen.getAllByText('chair', { selector: 'mark' });
    expect(marks.length).toBeGreaterThan(0);
  });
});

describe('ProductLookup — capped-results hint', () => {
  it('renders a "+ N more" footer when name results are capped', () => {
    const many: Product[] = Array.from({ length: 14 }, (_, i) => ({
      id: `p${i}`, name: `widget ${i}`, hsnPrimary: `9404000${String(i).padStart(1, '0')}`.slice(0, 8),
      hsnAlternates: [], description: '', hsChapterCode: '94',
    }));
    renderLookup({ products: many });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'widget' } });
    expect(screen.getByText(/\+\s*4\s*more/i)).toBeInTheDocument();
  });
  it('does not render the hint when results fit under the cap', () => {
    renderLookup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'chair' } });
    expect(screen.queryByText(/more.*narrow/i)).not.toBeInTheDocument();
  });
});

describe('ProductLookup — keyboard', () => {
  it('Enter on the input commits the active option', () => {
    const onPick = vi.fn();
    renderLookup({ onPickHSN: onPick });
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'chair' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onPick).toHaveBeenCalledWith('94013000');
  });
  it('Esc clears the query, second Esc clears the chapter filter', () => {
    renderLookup();
    fireEvent.click(screen.getByRole('button', { name: /94.*Furniture/i }));
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'chair' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect((input as HTMLInputElement).value).toBe('');
    expect(screen.getByText(/Chapter 94 — Furniture/)).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText(/Chapter 94 — Furniture/)).not.toBeInTheDocument();
  });
});
