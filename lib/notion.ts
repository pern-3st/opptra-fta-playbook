import { Client } from '@notionhq/client';

let _client: Client | null = null;

function client(): Client {
  if (_client) return _client;
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN is not set');
  _client = new Client({ auth: token });
  return _client;
}

// Notion API v5 / SDK 5.x replaced `databases.query` with `dataSources.query`.
// Each database now exposes one or more data sources; a migrated DB has exactly
// one. Cache the resolution so we only retrieve once per database id per process.
const dataSourceCache = new Map<string, string>();

async function resolveDataSourceId(databaseId: string): Promise<string> {
  const cached = dataSourceCache.get(databaseId);
  if (cached) return cached;
  const db = await client().databases.retrieve({ database_id: databaseId });
  const sources = (db as { data_sources?: Array<{ id: string }> }).data_sources;
  if (!sources || sources.length === 0) {
    throw new Error(`Database ${databaseId} has no data sources (partial response or empty DB)`);
  }
  const id = sources[0].id;
  dataSourceCache.set(databaseId, id);
  return id;
}

export async function queryAll(databaseId: string): Promise<any[]> {
  const dataSourceId = await resolveDataSourceId(databaseId);
  const out: any[] = [];
  let cursor: string | undefined;
  do {
    const r = await client().dataSources.query({ data_source_id: dataSourceId, start_cursor: cursor });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor ?? undefined : undefined;
  } while (cursor);
  return out;
}

export async function listBlocks(blockId: string): Promise<any[]> {
  const out: any[] = [];
  let cursor: string | undefined;
  do {
    const r = await client().blocks.children.list({ block_id: blockId, start_cursor: cursor });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor ?? undefined : undefined;
  } while (cursor);
  return out;
}
