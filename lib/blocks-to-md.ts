type Run = {
  plain_text: string;
  href?: string | null;
  annotations?: { bold?: boolean; italic?: boolean; code?: boolean };
};

function renderRun(r: Run): string {
  let s = r.plain_text;
  if (r.annotations?.code) s = '`' + s + '`';
  if (r.annotations?.italic) s = '_' + s + '_';
  if (r.annotations?.bold) s = '**' + s + '**';
  if (r.href) s = `[${s}](${r.href})`;
  return s;
}

function richText(runs: Run[] | undefined): string {
  return (runs ?? []).map(renderRun).join('');
}

export function blocksToMarkdown(blocks: any[]): string {
  const lines: string[] = [];
  let prevType: string | null = null;

  for (const b of blocks) {
    const t = b.type;
    let line = '';
    switch (t) {
      case 'heading_2':
        line = `## ${richText(b.heading_2.rich_text)}`;
        break;
      case 'heading_3':
        line = `### ${richText(b.heading_3.rich_text)}`;
        break;
      case 'paragraph':
        line = richText(b.paragraph.rich_text);
        break;
      case 'bulleted_list_item':
        line = `- ${richText(b.bulleted_list_item.rich_text)}`;
        break;
      case 'numbered_list_item':
        line = `1. ${richText(b.numbered_list_item.rich_text)}`;
        break;
      default:
        continue;
    }
    const isList = (x: string | null) => x === 'bulleted_list_item' || x === 'numbered_list_item';
    const needsBlankBefore =
      prevType !== null && !(isList(prevType) && isList(t));
    if (needsBlankBefore) lines.push('');
    lines.push(line);
    prevType = t;
  }
  return lines.length ? lines.join('\n') + '\n' : '';
}
