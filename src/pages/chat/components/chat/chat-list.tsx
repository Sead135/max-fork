import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button, IconButton, Input, Spinner, Typography } from '@maxhub/max-ui';
import type { ChatMeta } from '../../../../api';
import { Show } from '../../../../components';
import type { ChatPreviewState, ChatSummary } from '../../lib';
import { unreadLabel } from '../../lib';
import { ChatListRow } from './chat-list-row';
import { PlusIcon } from './plus-icon';

type ChatListItem = {
  chat: ChatSummary;
  meta: ChatMeta | undefined;
  preview: ChatPreviewState | undefined;
  title: string;
  badge: string | null;
};

type Props = {
  chats: ChatSummary[];
  metaById: Map<string, ChatMeta>;
  previewById: Map<string, ChatPreviewState>;
  selectedId: string | null;
  loading?: boolean;
  error?: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDisconnect: () => void;
  onRetry?: () => void;
};

export function ChatList({
  chats,
  metaById,
  previewById,
  selectedId,
  loading,
  error,
  onSelect,
  onAdd,
  onDisconnect,
  onRetry
}: Props) {
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: ChatListItem[] = [];

    for (const chat of chats) {
      const meta = metaById.get(chat.id);
      const title = meta?.title || chat.title;
      const matchesQuery =
        !q ||
        title.toLowerCase().includes(q) ||
        chat.id.toLowerCase().includes(q);
      if (!matchesQuery) {
        continue;
      }
      out.push({
        chat,
        meta,
        preview: previewById.get(chat.id),
        title,
        badge: unreadLabel(chat.unread)
      });
    }

    return out;
  }, [chats, metaById, previewById, query]);

  const emptyLabel = query.trim() ? 'Ничего не найдено' : 'Пока нет чатов';
  const showEmpty = !loading && !error && rows.length === 0;

  return (
    <Sidebar>
      <Header>
        <Typography.Headline>Чаты</Typography.Headline>
        <Button
          type="button"
          variant="destructive"
          size="small"
          onClick={onDisconnect}
        >
          Выйти
        </Button>
      </Header>

      <Search>
        <Input
          value={query}
          placeholder="Поиск"
          onChange={(event) => setQuery(event.target.value)}
        />
      </Search>

      <List>
        <Show when={!!loading}>
          <Empty>
            <Spinner size={28} />
          </Empty>
        </Show>

        <Show when={!loading && !!error}>
          <Empty>
            <Typography.Body variant="medium">{error}</Typography.Body>
            <Show when={!!onRetry}>
              <Button
                type="button"
                size="small"
                onClick={onRetry}
                style={{ marginTop: 12 }}
              >
                Повторить
              </Button>
            </Show>
          </Empty>
        </Show>

        <Show when={showEmpty}>
          <Empty>
            <Typography.Body variant="medium">{emptyLabel}</Typography.Body>
          </Empty>
        </Show>

        <Show when={!loading && !error}>
          {rows.map((row) => (
            <ChatListRow
              key={row.chat.id}
              chat={row.chat}
              meta={row.meta}
              preview={row.preview}
              title={row.title}
              badge={row.badge}
              active={row.chat.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </Show>
      </List>

      <Fab
        type="button"
        variant="primary"
        size="large"
        onClick={onAdd}
        aria-label="Новый чат"
      >
        <PlusIcon />
      </Fab>
    </Sidebar>
  );
}

const Sidebar = styled.aside`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  min-width: 280px;
  max-width: 100%;
  height: 100%;
  background: var(--background-primary);
  border-right: 1px solid var(--divider-primary);
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
    border-right: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 12px 8px 20px;
  min-height: 64px;
`;

const Search = styled.div`
  padding: 0 12px 12px;
`;

const List = styled.div`
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
`;

const Empty = styled.div`
  display: grid;
  place-items: center;
  padding: 32px 20px;
  color: var(--text-secondary);
  text-align: center;
`;

const Fab = styled(IconButton)`
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: 0 4px 16px var(--shadow-elevation-3-primary);
`;
