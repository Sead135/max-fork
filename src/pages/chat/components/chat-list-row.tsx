import { CellSimple } from '@maxhub/max-ui';
import styled from 'styled-components';
import type { ChatMeta } from '../../../api';
import { ChatAvatar } from './chat-avatar';
import { ChatListCaption } from './chat-list-caption';
import type { Chat } from '../lib/types';
import { isRecentlyOnline, type ChatPreviewState } from '../hooks/use-chat-meta';

const cellInnerClassNames = {
  before: 'chat-cell-before',
  content: 'chat-cell-content',
  title: 'chat-cell-title',
  subtitle: 'chat-cell-subtitle'
};

type Props = {
  chat: Chat;
  meta: ChatMeta | undefined;
  title: string;
  badge: string | null;
  preview: ChatPreviewState | undefined;
  active: boolean;
  onSelect: (id: string) => void;
};

export function ChatListRow({
  chat,
  meta,
  title,
  badge,
  preview,
  active,
  onSelect
}: Props) {
  return (
    <CellWrap $active={active}>
      <CellSimple
        title={title}
        subtitle={<ChatListCaption chat={chat} preview={preview} />}
        before={
          <AvatarSlot>
            <ChatAvatar
              chatId={chat.id}
              title={title}
              avatarUrl={meta?.avatar}
              size={48}
              online={isRecentlyOnline(meta?.lastSeen)}
            />
          </AvatarSlot>
        }
        after={badge ? <UnreadBadge>{badge}</UnreadBadge> : undefined}
        onClick={() => onSelect(chat.id)}
        innerClassNames={cellInnerClassNames}
      />
    </CellWrap>
  );
}

const CellWrap = styled.div<{ $active: boolean }>`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: ${({ $active }) =>
    $active ? 'var(--states-background-card-selected)' : 'transparent'};

  &:hover {
    background: ${({ $active }) =>
      $active
        ? 'var(--states-background-card-selected-hover)'
        : 'var(--states-background-card-hover)'};
  }

  & > * {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .chat-cell-before {
    flex-shrink: 0;
  }

  .chat-cell-content {
    min-width: 0;
    overflow: hidden;
  }

  .chat-cell-title,
  .chat-cell-subtitle {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-cell-subtitle a {
    color: inherit;
    text-decoration: none;
    pointer-events: none;
  }
`;

const AvatarSlot = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
`;

const UnreadBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--button-primary);
  color: var(--text-primary-inverse-static);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
`;
