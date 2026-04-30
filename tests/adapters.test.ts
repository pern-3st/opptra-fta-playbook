import { describe, it, expect } from 'vitest';
import * as f from './fixtures/notion-properties';
import { plainText, selectName, num, relationIds, checkbox } from '@/lib/adapters';

describe('adapters', () => {
  it('plainText concatenates rich_text plain_text values', () => {
    expect(plainText(f.richTextProp)).toBe('Active — 3.0 Protocol pending');
  });
  it('plainText returns empty string for empty rich_text', () => {
    expect(plainText({ type: 'rich_text', rich_text: [] })).toBe('');
  });
  it('plainText reads title properties', () => {
    expect(plainText(f.titleProp)).toBe('India');
  });
  it('selectName returns the option name or null', () => {
    expect(selectName(f.selectProp)).toBe('Active');
    expect(selectName(f.selectNullProp)).toBeNull();
  });
  it('num returns number or null', () => {
    expect(num(f.numberProp)).toBe(42);
    expect(num(f.numberNullProp)).toBeNull();
  });
  it('relationIds returns the id array', () => {
    expect(relationIds(f.relationProp)).toEqual(['aaa-111', 'bbb-222']);
  });
  it('checkbox returns the boolean', () => {
    expect(checkbox(f.checkboxProp)).toBe(true);
  });
});
