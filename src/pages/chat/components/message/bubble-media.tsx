import { useState } from 'react';
import styled from 'styled-components';

type Props = {
  src: string;
};

export function BubbleMedia({ src }: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <MediaWrap $ready={ready || failed}>
      {!ready && !failed ? <MediaSkeleton aria-hidden /> : null}
      {!failed ? (
        <MediaImg
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          $ready={ready}
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth > 0) {
              setReady(true);
            }
          }}
          onError={() => setFailed(true)}
        />
      ) : null}
    </MediaWrap>
  );
}

const MediaWrap = styled.div<{ $ready: boolean }>`
  position: relative;
  width: 100%;
  min-height: ${({ $ready }) => ($ready ? '0' : '180px')};
  border-radius: 12px;
  overflow: hidden;
  background: var(--background-secondary);
`;

const MediaSkeleton = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--states-background-card-hover) 0%,
    var(--divider-primary) 50%,
    var(--states-background-card-hover) 100%
  );
  background-size: 200% 100%;
  animation: media-shimmer 1.2s ease-in-out infinite;

  @keyframes media-shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

const MediaImg = styled.img<{ $ready: boolean }>`
  display: block;
  width: 100%;
  height: auto;
  max-height: 320px;
  object-fit: cover;
  opacity: ${({ $ready }) => ($ready ? 1 : 0)};
`;
