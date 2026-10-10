import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';
import { chatTitle } from '../../api';
import { Show } from '../../components';
import { queryErrorMessage } from '../../lib';
import { useSession } from '../../session';
import { AddChatModal, ChatList, ChatPane, ChatPaneEmpty } from './components';
import {
  useChatHistoryQuery,
  useChatMetaMap,
  useChatPreviewMap,
  useChatsQuery,
  useNotifications,
  useSendMessage
} from './hooks';
import { chatsQueryKey, phoneToChatId, type ChatSummary } from './lib';

export function ChatPage() {
  const { state: session, disconnect } = useSession();
  const credentials =
    session.status === 'connected' ? session.credentials : null;
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState('');
  const [addError, setAddError] = useState('');

  const chatsQuery = useChatsQuery(credentials);
  const chats = chatsQuery.data ?? [];
  const metaById = useChatMetaMap(credentials, chats);
  const previewById = useChatPreviewMap(credentials, chats);
  const historyQuery = useChatHistoryQuery(credentials, selectedId);
  const sendMutation = useSendMessage(credentials, selectedId);

  useNotifications(credentials, selectedId);

  const selectChat = (id: string) => {
    setSelectedId(id);
    if (!credentials) {
      return;
    }
    queryClient.setQueryData<ChatSummary[]>(
      chatsQueryKey(credentials),
      (prev) =>
        prev?.map((chat) => (chat.id === id ? { ...chat, unread: 0 } : chat))
    );
  };

  const addChat = (event: FormEvent) => {
    event.preventDefault();
    if (!credentials) {
      return;
    }
    const id = phoneToChatId(phone);
    if (id.replace('@c.us', '').length < 10) {
      setAddError('Введите номер телефона');
      return;
    }
    const summary: ChatSummary = {
      id,
      title: chatTitle(id),
      type: 'user',
      unread: 0
    };
    queryClient.setQueryData<ChatSummary[]>(
      chatsQueryKey(credentials),
      (prev) => {
        const list = prev ?? [];
        if (list.some((chat) => chat.id === id)) {
          return list;
        }
        return [summary, ...list];
      }
    );
    setAdding(false);
    setPhone('');
    setAddError('');
    selectChat(id);
  };

  if (!credentials) {
    return null;
  }

  const selected = chats.find(({ id }) => id === selectedId) ?? null;
  const selectedMeta = selectedId ? metaById.get(selectedId) : undefined;
  const sendError = queryErrorMessage(
    sendMutation.error,
    'Не удалось отправить сообщение'
  );

  return (
    <Layout $chatOpen={!!selectedId}>
      <ChatList
        chats={chats}
        metaById={metaById}
        previewById={previewById}
        selectedId={selectedId}
        loading={chatsQuery.isLoading && !chatsQuery.data}
        error={chatsQuery.data ? '' : chatsQuery.errorMessage}
        onSelect={selectChat}
        onAdd={() => {
          setAdding(true);
          setAddError('');
        }}
        onDisconnect={disconnect}
        onRetry={() => void chatsQuery.refetch()}
      />

      {selected ? (
        <ChatPane
          summary={selected}
          meta={selectedMeta}
          messages={historyQuery.data ?? []}
          loading={historyQuery.isLoading}
          historyError={historyQuery.errorMessage}
          sendError={sendError}
          sending={sendMutation.isPending}
          onBack={() => setSelectedId(null)}
          onSend={(text) => {
            sendMutation.reset();
            void sendMutation.mutateAsync(text);
          }}
        />
      ) : (
        <ChatPaneEmpty />
      )}

      <Show when={adding}>
        <AddChatModal
          phone={phone}
          error={addError}
          onPhoneChange={setPhone}
          onClose={() => setAdding(false)}
          onSubmit={addChat}
        />
      </Show>
    </Layout>
  );
}

const Layout = styled.div<{ $chatOpen: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    & > aside {
      display: ${({ $chatOpen }) => ($chatOpen ? 'none' : 'flex')};
    }

    & > section {
      display: ${({ $chatOpen }) => ($chatOpen ? 'block' : 'none')};
    }
  }
`;
