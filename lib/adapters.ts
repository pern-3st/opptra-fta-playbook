import type { NotionProp } from './notion';

export function plainText(prop: NotionProp): string {
  if (!prop) return '';
  const arr = prop.title ?? prop.rich_text;
  if (!Array.isArray(arr)) return '';
  return arr.map(t => t.plain_text ?? '').join('');
}

export function selectName(prop: NotionProp): string | null {
  return prop?.select?.name ?? null;
}

export function num(prop: NotionProp): number | null {
  return typeof prop?.number === 'number' ? prop.number : null;
}

export function relationIds(prop: NotionProp): string[] {
  if (!Array.isArray(prop?.relation)) return [];
  return prop.relation.map(r => r.id);
}

export function checkbox(prop: NotionProp): boolean {
  return Boolean(prop?.checkbox);
}
