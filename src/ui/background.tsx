import type { PropsWithChildren } from 'react';
import styled from 'styled-components';
import patternSpaceUrl from '../assets/pattern_space.svg';

type BackgroundProps = PropsWithChildren<{
  centered?: boolean;
}>;

export function Background({ children, centered = true }: BackgroundProps) {
  return (
    <Container $centered={centered}>
      <Layers aria-hidden>
        <LayerBase />
        <LayerAddition />
        <LayerPattern />
      </Layers>
      <Content $centered={centered}>{children}</Content>
    </Container>
  );
}

const Container = styled.div<{ $centered: boolean }>`
  background: #25262d;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  isolation: isolate;
`;

const Layers = styled.div`
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const Content = styled.div<{ $centered: boolean }>`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: ${({ $centered }) => ($centered ? 'grid' : 'flex')};
  place-items: ${({ $centered }) => ($centered ? 'center' : 'stretch')};
  flex-direction: column;
`;

const LayerBase = styled.div`
  background: linear-gradient(
    28deg,
    var(--chat-background-background-step-1) 8.03%,
    var(--chat-background-background-step-2) 91.51%
  );
  position: absolute;
  inset: 0;
`;

const LayerAddition = styled.div`
  background:
    radial-gradient(
      57.57% 53.61% at 94.4% 14.38%,
      var(--chat-background-additional-step-1) 0%,
      var(--chat-background-additional-step-2) 50%,
      var(--chat-background-additional-step-3) 100%
    ),
    radial-gradient(
      140.37% 51.38% at 0% 80.05%,
      var(--chat-background-additional-step-4) 0%,
      var(--chat-background-additional-step-5) 50%,
      var(--chat-background-additional-step-6) 100%
    );
  position: absolute;
  inset: 0;
`;

const LayerPattern = styled.div`
  background:
    radial-gradient(
      57.57% 53.61% at 94.4% 14.38%,
      var(--chat-background-pattern-step-1) 0%,
      var(--chat-background-pattern-step-2) 50%,
      var(--chat-background-pattern-step-3) 100%
    ),
    radial-gradient(
      140.37% 51.38% at 0% 80.05%,
      var(--chat-background-pattern-step-4) 0%,
      var(--chat-background-pattern-step-5) 50%,
      var(--chat-background-pattern-step-6) 100%
    ),
    linear-gradient(
      28deg,
      var(--chat-background-pattern-gradient-step-1) 8.03%,
      var(--chat-background-pattern-gradient-step-2) 91.51%
    );
  position: absolute;
  inset: 0;

  -webkit-mask-image: url(${patternSpaceUrl});
  -webkit-mask-position: 50%;
  -webkit-mask-size: auto;
  -webkit-mask-repeat: repeat;
  mask-image: url(${patternSpaceUrl});
  mask-position: 50%;
  mask-size: auto;
  mask-repeat: repeat;
`;
