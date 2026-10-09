import type { ReactNode } from 'react';
import styled from 'styled-components';

type ModalShellProps = {
  children: ReactNode;
  onClose: () => void;
  zIndex?: number;
  maxHeight?: string;
};

export function ModalShell({
  children,
  onClose,
  zIndex = 20,
  maxHeight
}: ModalShellProps) {
  return (
    <Overlay $zIndex={zIndex} onClick={onClose}>
      <Dialog
        $maxHeight={maxHeight}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </Dialog>
    </Overlay>
  );
}

const Overlay = styled.div<{ $zIndex: number }>`
  position: fixed;
  inset: 0;
  z-index: ${({ $zIndex }) => $zIndex};
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--background-overlay);
`;

const Dialog = styled.div<{ $maxHeight?: string }>`
  width: min(420px, 100%);
  max-height: ${({ $maxHeight }) => $maxHeight ?? 'none'};

  & > div {
    height: auto;
    max-height: ${({ $maxHeight }) => $maxHeight ?? 'none'};
    max-width: 100%;
    border-radius: var(--size-28);
    overflow: ${({ $maxHeight }) => ($maxHeight ? 'auto' : 'visible')};
    background: ${({ $maxHeight }) =>
      $maxHeight ? 'var(--background-secondary)' : 'transparent'};
  }
`;
