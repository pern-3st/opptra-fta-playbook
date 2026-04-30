import { describe, it, expect } from 'vitest';
import * as f from './fixtures/notion-blocks';
import { blocksToMarkdown } from '@/lib/blocks-to-md';

describe('blocksToMarkdown', () => {
  it('renders paragraphs', () => {
    expect(blocksToMarkdown([f.paragraphBlock])).toBe('A simple paragraph.\n');
  });
  it('renders heading_2 as ## and heading_3 as ###', () => {
    expect(blocksToMarkdown([f.headingH2Block, f.headingH3Block]))
      .toBe('## Tracks\n\n### Sub-section\n');
  });
  it('renders bullet items as Markdown bullets', () => {
    expect(blocksToMarkdown([f.bulletBlock])).toBe('- A bullet point.\n');
  });
  it('renders numbered list items as 1. (Markdown auto-numbers)', () => {
    expect(blocksToMarkdown([f.numberedBlock, f.numberedBlock]))
      .toBe('1. First step.\n1. First step.\n');
  });
  it('preserves links inside bullets', () => {
    expect(blocksToMarkdown([f.bulletWithLinkBlock]))
      .toBe('- [ATIGA Official Text](https://asean.org/book/atiga/)\n');
  });
  it('preserves bold annotations as **bold**', () => {
    expect(blocksToMarkdown([f.boldRunBlock])).toBe('Active **— pending**\n');
  });
  it('skips unsupported block types silently', () => {
    expect(blocksToMarkdown([f.unsupportedBlock])).toBe('');
  });
  it('separates blocks with a blank line where appropriate', () => {
    expect(blocksToMarkdown([f.headingH2Block, f.bulletBlock, f.bulletBlock]))
      .toBe('## Tracks\n\n- A bullet point.\n- A bullet point.\n');
  });
});
