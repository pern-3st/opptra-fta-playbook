import { plainText, selectName, num, relationIds, checkbox } from './adapters';
import type { NotionPage } from './notion';
import type { Country, HSChapter, FTA, Product, Lane } from './types';

export function mapCountry(p: NotionPage): Country {
  return {
    id: p.id,
    name: plainText(p.properties['Country']),
    region: selectName(p.properties['Region']),
    regionSeq: num(p.properties['Region Seq']),
    countrySeq: num(p.properties['Country Seq']),
    notes: plainText(p.properties['Notes']),
  };
}

export function mapChapter(p: NotionPage): HSChapter {
  return {
    id: p.id,
    code: plainText(p.properties['Chapter']),
    name: plainText(p.properties['Name']),
    description: plainText(p.properties['Description']),
    section: plainText(p.properties['Section']),
    notes: plainText(p.properties['Notes']),
  };
}

export function mapProduct(p: NotionPage): Product {
  const hsnPrimary = plainText(p.properties['HSN']);
  const altsRaw = plainText(p.properties['HSN Alternates']);
  return {
    id: p.id,
    name: plainText(p.properties['Product']),
    hsnPrimary,
    hsnAlternates: altsRaw ? altsRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
    description: plainText(p.properties['Description']),
    hsChapterCode: hsnPrimary.slice(0, 2),
  };
}

export function mapLane(p: NotionPage): Lane {
  const ftaIds = relationIds(p.properties['FTA']);
  return {
    id: p.id,
    originId: relationIds(p.properties['Origin'])[0] ?? '',
    destinationId: relationIds(p.properties['Destination'])[0] ?? '',
    ftaId: ftaIds[0] ?? null,
    isFreeZone: checkbox(p.properties['Free Zone']),
    cooForm: plainText(p.properties['COO Form']),
    notes: plainText(p.properties['Notes']),
  };
}

export function mapFTAProperties(p: NotionPage): Omit<FTA, 'body'> {
  return {
    id: p.id,
    name: plainText(p.properties['FTA']),
    shortCode: plainText(p.properties['Short Code']),
    fullName: plainText(p.properties['Full Name']),
    status: selectName(p.properties['Status']) ?? 'Active',
    statusLabel: plainText(p.properties['Status Label']),
    inForce: plainText(p.properties['In Force']),
    coverage: plainText(p.properties['Coverage']),
    tariffFramework: plainText(p.properties['Tariff Framework']),
    cooForm: plainText(p.properties['COO Form']),
    roo: plainText(p.properties['Rules of Origin']),
    validity: plainText(p.properties['Validity']),
    claimWindow: plainText(p.properties['Claim Window']),
    retention: plainText(p.properties['Retention']),
    description: plainText(p.properties['Description']),
    priority: num(p.properties['Priority']),
    memberCountryIds: relationIds(p.properties['Members']),
  };
}
