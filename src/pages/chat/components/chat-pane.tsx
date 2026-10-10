import { Icon16Chevron, IconButton, Typography } from '@maxhub/max-ui';
import { useState } from 'react';
import styled from 'styled-components';
import type { ChatMeta, Credentials } from '../../../api';
import { Background } from '../../../ui';
import { ChatAvatar } from './chat-avatar';
import { ContactProfileModal } from './contact-profile-modal';
import { MessageComposer } from './message-composer';
import { MessageScroller } from './message-scroller';
import type { Chat } from '../lib/types';
import { isRecentlyOnline } from '../hooks/use-chat-meta';
import { Show } from '../../../components';

type Props = {
  chat: Chat | null;
  meta?: ChatMeta;
  credentials: Credentials | null;
  loading?: boolean;
  historyError?: string;
  sendError?: string;
  sending?: boolean;
  onBack: () => void;
  onSend: (text: string) => void;
};

export function ChatPane({
  chat,
  meta,
  credentials,
  loading,
  historyError,
  sendError,
  sending,
  onBack,
  onSend
}: Props) {
  const [profileOpen, setProfileOpen] = useState(false);

  if (!chat) {
    return (
      <Pane>
        <Background>
          <Empty>
            <Hint>Добавьте или выберите чат</Hint>
          </Empty>
        </Background>
      </Pane>
    );
  }

  const title = meta?.title || chat.title;

  return (
    <Pane>
      <Background centered={false}>
        <Column>
          <Header>
            <Back
              type="button"
              variant="ghost"
              size="small"
              onClick={onBack}
              aria-label="Назад"
            >
              <ChevronBack>
                <Icon16Chevron />
              </ChevronBack>
            </Back>
            <ProfileButton
              type="button"
              onClick={() => setProfileOpen(true)}
              disabled={!credentials}
            >
              <ChatAvatar
                chatId={chat.id}
                title={title}
                avatarUrl={meta?.avatar}
                size={40}
                online={isRecentlyOnline(meta?.lastSeen)}
              />
              <Typography.Title>{title}</Typography.Title>
            </ProfileButton>
          </Header>

          <MessageScroller
            key={chat.id}
            messages={chat.messages}
            loading={loading}
            historyError={historyError}
          />

          <Show when={!!sendError}>
            <SendError role="alert">{sendError}</SendError>
          </Show>

          <MessageComposer key={chat.id} onSend={onSend} disabled={sending} />
        </Column>
      </Background>

      <Show when={!!profileOpen && !!credentials}>
        <ContactProfileModal
          chatId={chat.id}
          fallbackTitle={title}
          chatType={chat.type || meta?.chatType}
          meta={meta}
          credentials={credentials!}
          onClose={() => setProfileOpen(false)}
        />
      </Show>
    </Pane>
  );
}

const Pane = styled.section`
  min-width: 0;
  height: 100%;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
`;

const Empty = styled.div`
  padding: 24px;
  text-align: center;
`;

const Hint = styled(Typography.Title)`
  display: inline-block;
  padding: 10px 16px;
  border-radius: 16px;
  background: var(--bubbles-system-step-2);
  color: var(--text-primary);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 64px;
  padding: 8px 16px;
  background: var(--background-primary);
  border-bottom: 1px solid var(--divider-primary);
`;

const ProfileButton = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
  padding: 4px 8px 4px 4px;
  margin: 0;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  color: inherit;

  &:hover {
    background: var(--states-background-card-hover);
  }

  &:disabled {
    cursor: default;
  }

  & > *:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Back = styled(IconButton)`
  display: none;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

const ChevronBack = styled.span`
  display: inline-flex;
  transform: rotate(180deg);
`;

const SendError = styled.div`
  padding: 0 16px 8px;
  color: var(--text-negative);
  font-size: 13px;
`;
