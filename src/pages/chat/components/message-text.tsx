import type { ReactNode } from 'react';
import styled from 'styled-components';

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

type Props = {
  text: string;
  $fromMe?: boolean;
};

export function MessageText({ text, $fromMe }: Props) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(MARKDOWN_LINK_RE.source, 'g');

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const label = match[1]!;
    const href = match[2]!;
    nodes.push(
      <Link
        key={`${match.index}-${href}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        $fromMe={Boolean($fromMe)}
        onClick={(event) => event.stopPropagation()}
      >
        {label}
      </Link>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <>{nodes.length > 0 ? nodes : text}</>;
}

const Link = styled.a<{ $fromMe: boolean }>`
  color: ${({ $fromMe }) =>
    $fromMe ? 'var(--text-primary-inverse-static)' : 'var(--text-themed)'};
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-all;

  &:hover {
    opacity: 0.85;
  }
`;
