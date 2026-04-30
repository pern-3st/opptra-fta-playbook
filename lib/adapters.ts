type AnyProp = any;

export function plainText(prop: AnyProp): string {
  if (!prop) return '';
  const arr = prop.title ?? prop.rich_text;
  if (!Array.isArray(arr)) return '';
  return arr.map((t: any) => t.plain_text ?? '').join('');
}

export function selectName(prop: AnyProp): string | null {
  return prop?.select?.name ?? null;
}

export function num(prop: AnyProp): number | null {
  return typeof prop?.number === 'number' ? prop.number : null;
}

export function relationIds(prop: AnyProp): string[] {
  if (!Array.isArray(prop?.relation)) return [];
  return prop.relation.map((r: any) => r.id);
}

export function checkbox(prop: AnyProp): boolean {
  return Boolean(prop?.checkbox);
}
