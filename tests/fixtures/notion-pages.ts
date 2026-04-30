const rt = (s: string) => ({ type: 'rich_text' as const, rich_text: [{ plain_text: s, type: 'text' as const }] });
const title = (s: string) => ({ type: 'title' as const, title: [{ plain_text: s, type: 'text' as const }] });
const sel = (name: string | null) => ({ type: 'select' as const, select: name ? { name } : null });
const num = (n: number | null) => ({ type: 'number' as const, number: n });
const rel = (...ids: string[]) => ({ type: 'relation' as const, relation: ids.map(id => ({ id })) });
const cb = (v: boolean) => ({ type: 'checkbox' as const, checkbox: v });

export const countryPage = {
  id: 'country-1',
  properties: {
    'Country': title('India'),
    'Region': sel('South Asia'),
    'Region Seq': num(1),
    'Country Seq': num(1),
    'Notes': rt('IN office'),
  },
};

export const chapterPage = {
  id: 'chapter-61',
  properties: {
    'Chapter': title('61'),
    'Name': rt('Knitted/Crocheted Apparel'),
    'Description': rt('Articles of apparel, knitted or crocheted'),
    'Section': rt('Section XI'),
    'Notes': rt(''),
  },
};

export const productPage = {
  id: 'product-1',
  properties: {
    'Product': title('cotton t-shirt'),
    'HSN': rt('61091000'),
    'HSN Alternates': rt('6109, 610910'),
    'Description': rt('Knitted cotton t-shirt'),
  },
};

export const lanePage = {
  id: 'lane-1',
  properties: {
    'Origin': rel('country-1'),
    'Destination': rel('country-2'),
    'FTA': rel('fta-1'),
    'Free Zone': cb(true),
    'COO Form': rt('Form X'),
    'Notes': rt('FZ-only'),
  },
};

export const ftaPage = {
  id: 'fta-1',
  properties: {
    'FTA': title('ATIGA'),
    'Short Code': rt('ATIGA'),
    'Full Name': rt('ASEAN Trade in Goods Agreement'),
    'Status': sel('Active'),
    'Status Label': rt('Active — 3.0 Protocol pending'),
    'In Force': rt('17 May 2010'),
    'Coverage': rt('All ASEAN-10'),
    'Tariff Framework': rt('Free for >99% of tariff lines'),
    'COO Form': rt('Form D'),
    'Rules of Origin': rt('40% RVC or CTH'),
    'Validity': rt('12 months'),
    'Claim Window': rt('At import'),
    'Retention': rt('5 years'),
    'Description': rt('ASEAN regional FTA.'),
    'Priority': num(10),
    'Members': rel('country-1', 'country-2'),
  },
};
