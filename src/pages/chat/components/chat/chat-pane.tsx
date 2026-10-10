import { useState } from 'react';
import styled from 'styled-components';
import { Icon16Chevron, IconButton, Typography } from '@maxhub/max-ui';
import type { ChatMeta } from '../../../../api';
import { Show } from '../../../../components';
import { Background } from '../../../../ui';
import {
  isRecentlyOnline,
  type ChatMessage,
  type ChatSummary
} from '../../lib';
import { ContactProfileModal } from '../contact/contact-profile-modal';
import { MessageComposer } from '../message/message-composer';
import { MessageScroller } from '../message/message-scroller';
import { ChatAvatar } from './chat-avatar';

type Props = {
  summary: ChatSummary;
  meta?: ChatMeta;
  messages: ChatMessage[];
  loading?: boolean;
  historyError?: string;
  sendError?: string;
  sending?: boolean;
  onBack: () => void;
  onSend: (text: string) => void;
};

export function ChatPane({
  summary,
  meta,
  messages,
  loading,
  historyError,
  sendError,
  sending,
  onBack,
  onSend
}: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const title = meta?.title || summary.title;

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
            <ProfileButton type="button" onClick={() => setProfileOpen(true)}>
              <ChatAvatar
                chatId={summary.id}
                title={title}
                avatarUrl={meta?.avatar}
                size={40}
                online={isRecentlyOnline(meta?.lastSeen)}
              />
              <Typography.Title>{title}</Typography.Title>
            </ProfileButton>
          </Header>

          <MessageScroller
            chatId={summary.id}
            messages={messages}
            loading={loading}
            historyError={historyError}
          />

          <Show when={!!sendError}>
            <SendError role="alert">{sendError}</SendError>
          </Show>

          <MessageComposer onSend={onSend} disabled={sending} />
        </Column>
      </Background>

      <Show when={profileOpen}>
        <ContactProfileModal
          chatId={summary.id}
          fallbackTitle={title}
          chatType={summary.type || meta?.chatType}
          meta={meta}
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
