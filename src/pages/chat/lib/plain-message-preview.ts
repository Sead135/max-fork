const MARKDOWN_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

export function plainMessagePreview(text: string) {
  return text
    .replace(
      new RegExp(MARKDOWN_LINK_RE.source, 'g'),
      (_, label: string, href: string) => label.trim() || href
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export type MessageLinkPart =
  | { kind: 'text'; value: string }
  | { kind: 'link'; label: string; href: string; key: string };

export function parseMessageLinks(text: string): MessageLinkPart[] {
  const parts: MessageLinkPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(MARKDOWN_LINK_RE.source, 'g');

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: 'text', value: text.slice(lastIndex, match.index) });
    }

    const [fullMatch, label, href] = match;

    parts.push({
      kind: 'link',
      label,
      href,
      key: `${match.index}-${href}`
    });

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push({ kind: 'text', value: text.slice(lastIndex) });
  }

  return parts;
}
