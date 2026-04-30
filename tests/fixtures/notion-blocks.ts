const text = (s: string, extra: any = {}) => ({
  type: 'text',
  plain_text: s,
  text: { content: s, link: extra.href ? { url: extra.href } : null },
  annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default', ...(extra.annotations ?? {}) },
  href: extra.href ?? null,
});

export const paragraphBlock = {
  type: 'paragraph',
  paragraph: { rich_text: [text('A simple paragraph.')] },
};

export const headingH2Block = {
  type: 'heading_2',
  heading_2: { rich_text: [text('Tracks')] },
};

export const headingH3Block = {
  type: 'heading_3',
  heading_3: { rich_text: [text('Sub-section')] },
};

export const bulletBlock = {
  type: 'bulleted_list_item',
  bulleted_list_item: { rich_text: [text('A bullet point.')] },
};

export const bulletWithLinkBlock = {
  type: 'bulleted_list_item',
  bulleted_list_item: {
    rich_text: [
      text('ATIGA Official Text', { href: 'https://asean.org/book/atiga/' }),
    ],
  },
};

export const numberedBlock = {
  type: 'numbered_list_item',
  numbered_list_item: { rich_text: [text('First step.')] },
};

export const boldRunBlock = {
  type: 'paragraph',
  paragraph: {
    rich_text: [
      text('Active ', { annotations: {} }),
      text('— pending', { annotations: { bold: true } }),
    ],
  },
};

export const unsupportedBlock = { type: 'image', image: {} };
