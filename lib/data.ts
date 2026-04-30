import { unstable_cache } from 'next/cache';
import { queryAll, listBlocks, type NotionPage } from './notion';
import { mapCountry, mapChapter, mapProduct, mapLane, mapFTAProperties } from './mappers';
import { blocksToMarkdown } from './blocks-to-md';
import { sectionFTABody, sectionComplianceDefaults } from './sectioner';
import type { PlaybookData, FTA } from './types';

const TAG = 'playbook';
const FTA_BODY_CONCURRENCY = 4;

async function mapInPool<T, U>(items: T[], limit: number, fn: (item: T) => Promise<U>): Promise<U[]> {
  const out: U[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

async function fetchFTAWithBody(p: NotionPage): Promise<FTA> {
  const props = mapFTAProperties(p);
  const blocks = await listBlocks(p.id);
  const md = blocksToMarkdown(blocks);
  return { ...props, body: sectionFTABody(md) };
}

async function fetchComplianceDefaults() {
  const blocks = await listBlocks(process.env.NOTION_PAGE_COMPLIANCE_DEFAULTS!);
  return sectionComplianceDefaults(blocksToMarkdown(blocks));
}

export async function fetchPlaybookData(): Promise<PlaybookData> {
  const [
    countriesRaw, chaptersRaw, ftasRaw, productsRaw, lanesRaw,
  ] = await Promise.all([
    queryAll(process.env.NOTION_DB_COUNTRIES!),
    queryAll(process.env.NOTION_DB_HS_CHAPTERS!),
    queryAll(process.env.NOTION_DB_FTAS!),
    queryAll(process.env.NOTION_DB_PRODUCTS!),
    queryAll(process.env.NOTION_DB_LANES!),
  ]);

  const [ftas, defaults] = await Promise.all([
    mapInPool(ftasRaw, FTA_BODY_CONCURRENCY, fetchFTAWithBody),
    fetchComplianceDefaults(),
  ]);

  return {
    countries: countriesRaw.map(mapCountry),
    chapters: chaptersRaw.map(mapChapter),
    ftas,
    products: productsRaw.map(mapProduct),
    lanes: lanesRaw.map(mapLane),
    defaults,
    syncedAt: new Date().toISOString(),
  };
}

export const getPlaybookData = unstable_cache(
  fetchPlaybookData,
  ['playbook-data'],
  { revalidate: 3600, tags: [TAG] }
);

export const PLAYBOOK_TAG = TAG;
