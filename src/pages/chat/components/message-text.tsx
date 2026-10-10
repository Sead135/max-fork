import { Fragment } from 'react';
import styled from 'styled-components';
import { parseMessageLinks } from '../lib';

type Props = {
  text: string;
};

export function MessageText({ text }: Props) {
  if (!text) {
    return null;
  }

  const parts = parseMessageLinks(text);

  return (
    <Fragment>
      {parts.map((part) => {
        if (part.kind === 'text') {
          return <Fragment key={`t-${part.at}`}>{part.value}</Fragment>;
        }

        return (
          <InlineLink
            key={`l-${part.at}`}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            {part.label}
          </InlineLink>
        );
      })}
    </Fragment>
  );
}

export const InlineLink = styled.a`
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-all;

  &:hover {
    opacity: 0.85;
  }
`;
