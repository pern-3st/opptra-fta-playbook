export type FTAStatus = 'Active' | 'Under Review' | 'Paused' | 'Inactive' | string;

export interface Country {
  id: string;
  name: string;
  region: string | null;
  regionSeq: number | null;
  countrySeq: number | null;
  notes: string;
}

export interface HSChapter {
  id: string;
  code: string;
  name: string;
  description: string;
  section: string;
  notes: string;
}

export interface FTA {
  id: string;
  name: string;
  shortCode: string;
  fullName: string;
  status: FTAStatus;
  statusLabel: string;
  inForce: string;
  coverage: string;
  tariffFramework: string;
  cooForm: string;
  roo: string;
  validity: string;
  claimWindow: string;
  retention: string;
  description: string;
  priority: number | null;
  memberCountryIds: string[];
  partnerCountryIds: string[];
  body: {
    description: string;
    tracks: string;
    chapterNotes: string;
    extras: string;
    resources: string;
    chapterClassifications: {
      sensitive: string[];
      excluded: string[];
    };
  };
}

export interface Product {
  id: string;
  name: string;
  hsnPrimary: string;
  hsnAlternates: string[];
  description: string;
  hsChapterCode: string;
}

export interface Lane {
  id: string;
  originId: string;
  destinationId: string;
  ftaId: string | null;
  isFreeZone: boolean;
  cooForm: string;
  notes: string;
}

export interface ComplianceDefaults {
  documentRequirements: string;
  claimConditions: string;
}

export interface PlaybookData {
  countries: Country[];
  chapters: HSChapter[];
  ftas: FTA[];
  products: Product[];
  lanes: Lane[];
  defaults: ComplianceDefaults;
  syncedAt: string;
}
