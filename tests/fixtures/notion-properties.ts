export const titleProp = {
  type: 'title',
  title: [{ plain_text: 'India', type: 'text' as const }],
};
export const richTextProp = {
  type: 'rich_text',
  rich_text: [
    { plain_text: 'Active — 3.0 ', type: 'text' as const, annotations: { bold: false } },
    { plain_text: 'Protocol pending', type: 'text' as const, annotations: { bold: true } },
  ],
};
export const selectProp = { type: 'select', select: { name: 'Active' } };
export const selectNullProp = { type: 'select', select: null };
export const numberProp = { type: 'number', number: 42 };
export const numberNullProp = { type: 'number', number: null };
export const relationProp = {
  type: 'relation',
  relation: [{ id: 'aaa-111' }, { id: 'bbb-222' }],
};
export const checkboxProp = { type: 'checkbox', checkbox: true };
