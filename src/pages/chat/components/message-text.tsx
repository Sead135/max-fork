import { Fragment } from 'react';
import styled from 'styled-components';
import { parseMessageLinks } from '../lib';

type Props = {
  text: string;
  $fromMe?: boolean;
};

export function MessageText({ text, $fromMe }: Props) {
  const parts = parseMessageLinks(text);

  if (parts.length === 0) {
    return <>{text}</>;
  }

  return (
    <Fragment>
      {parts.map((part) => {
        if (part.kind === 'text') {
          return <Fragment key={part.key}>{part.value}</Fragment>;
        }

        return (
          <Link
            key={part.key}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            $fromMe={$fromMe}
            onClick={(event) => event.stopPropagation()}
          >
            {part.label}
          </Link>
        );
      })}
    </Fragment>
  );
}

const Link = styled.a<{ $fromMe?: boolean }>`
  color: ${({ $fromMe }) =>
    $fromMe ? 'var(--text-primary-inverse-static)' : 'var(--text-themed)'};
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-all;

  &:hover {
    opacity: 0.85;
  }
`;
