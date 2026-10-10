const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s<>"']+)/g;

export type MessageLinkPart =
  | { kind: 'text'; value: string; at: number }
  | { kind: 'link'; label: string; href: string; at: number };

export function parseMessageLinks(text: string): MessageLinkPart[] {
  const parts: MessageLinkPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(LINK_RE.source, 'g');

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        kind: 'text',
        value: text.slice(lastIndex, match.index),
        at: lastIndex
      });
    }

    const [fullMatch, mdLabel, mdHref, bareHref] = match;
    let href = mdHref ?? bareHref ?? '';
    let label = mdLabel ?? bareHref ?? '';
    let consumed = fullMatch.length;

    if (!mdHref && bareHref) {
      const trimmed = bareHref.replace(/[),.!?;:]+$/u, '');
      consumed -= bareHref.length - trimmed.length;
      href = trimmed;
      label = trimmed;
    }

    if (href && label) {
      parts.push({ kind: 'link', label, href, at: match.index });
    }

    lastIndex = match.index + consumed;
  }

  if (lastIndex < text.length) {
    parts.push({ kind: 'text', value: text.slice(lastIndex), at: lastIndex });
  }

  return parts;
}

export function plainMessagePreview(text: string) {
  return parseMessageLinks(text)
    .map((part) => (part.kind === 'link' ? part.label : part.value))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}
