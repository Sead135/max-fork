import { Icon16CloseIos, IconButton, Typography } from '@maxhub/max-ui';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Show } from '../components';

type ModalProps = {
  title?: string;
  onClose?: () => void;
  headerLeftAction?: ReactNode;
  children: ReactNode;
};

export function Modal({
  title,
  children,
  headerLeftAction,
  onClose
}: ModalProps) {
  const showHeader = Boolean(title || headerLeftAction);

  return (
    <Container>
      <Show when={Boolean(onClose)}>
        <CloseButton
          type="button"
          variant="ghost"
          size="small"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <Icon16CloseIos />
        </CloseButton>
      </Show>

      <Show when={showHeader}>
        <Header>
          {headerLeftAction}
          <Show when={Boolean(title)}>
            <Title>{title}</Title>
          </Show>
        </Header>
      </Show>

      <Content>{children}</Content>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  --button-ghost-text-color: var(--text-themed);
  --button-ghost-text-color-disabled: var(--states-text-themed-disabled);
  flex-direction: column;
  align-items: center;
  width: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
  border-radius: var(--size-28);
  -webkit-backdrop-filter: blur(25px);
  backdrop-filter: blur(25px);
  border: 1px solid var(--bubbles-system-stroke-step-2);
  background: var(--background-primary);
  max-width: 580px;
  box-shadow: 0 4px 24px #00000014;
  padding: 16px;

  @media (max-width: 768px) {
    height: 100%;
    border-radius: 0;
    max-width: 100%;
  }
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 54px;
  padding-inline: 40px;
`;

const Title = styled(Typography.Headline)`
  flex: 1;
  min-width: 0;
  text-align: center;
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
`;
