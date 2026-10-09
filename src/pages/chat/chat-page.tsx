import { useEffect, useMemo, type FormEvent } from 'react';
import styled from 'styled-components';
import { sendMessage } from '../../api/green-api';
import { Show } from '../../components';
import { useSession } from '../../session';
import { AddChatModal } from './components/add-chat-modal';
import { ChatList } from './components/chat-list';
import { ChatPane } from './components/chat-pane';
import { useChatHistoryQuery } from './hooks/use-chat-history-query';
import { useChatPageState } from './hooks/use-chat-page-state';
import { useChatsMetaMap, useChatsPreviewMap } from './hooks/use-chat-meta';
import { useChatsQuery } from './hooks/use-chats-query';
import { useNotifications } from './hooks/use-notifications';
import { mergeChats } from './lib/merge-chats';
import { queryErrorMessage } from './lib/query-error-message';
import { chatTitle, phoneToChatId, type ChatMessage } from './lib/types';

export function ChatPage() {
  const { state: session, disconnect } = useSession();
  const credentials =
    session.status === 'connected' ? session.credentials : null;

  const { state, dispatch, setChats } = useChatPageState();

  useNotifications(credentials, state.selectedId, setChats);

  const chatsQuery = useChatsQuery(credentials);
  const historyQuery = useChatHistoryQuery(credentials, state.selectedId);

  useEffect(() => {
    if (!chatsQuery.data) {
      return;
    }
    setChats((prev) => mergeChats(chatsQuery.data, prev));
  }, [chatsQuery.data, setChats]);

  useEffect(() => {
    if (!state.selectedId || !historyQuery.data) {
      return;
    }
    const chatId = state.selectedId;
    const messages = historyQuery.data;
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, messages } : chat))
    );
  }, [state.selectedId, historyQuery.data, setChats]);

  const metaById = useChatsMetaMap(credentials, state.chats);
  const previewById = useChatsPreviewMap(credentials, state.chats);

  const selected = useMemo(() => {
    const chat = state.chats.find((item) => item.id === state.selectedId);
    if (!chat) {
      return null;
    }
    const meta = metaById.get(chat.id);
    if (!meta) {
      return chat;
    }
    return { ...chat, title: meta.title };
  }, [state.chats, metaById, state.selectedId]);

  const chatsError = queryErrorMessage(
    chatsQuery.error,
    'Не удалось загрузить чаты'
  );
  const historyError = queryErrorMessage(
    historyQuery.error,
    'Не удалось загрузить историю чата'
  );

  const addChat = (event: FormEvent) => {
    event.preventDefault();
    const id = phoneToChatId(state.phone);

    if (id.replace('@c.us', '').length < 10) {
      dispatch({ type: 'set_add_error', error: 'Введите номер телефона' });
      return;
    }

    dispatch({
      type: 'add_chat',
      chat: {
        id,
        title: chatTitle(id),
        type: 'user',
        messages: [],
        unread: 0
      }
    });
  };

  const send = async (text: string) => {
    if (!credentials || !state.selectedId) {
      return;
    }

    dispatch({ type: 'send_start' });
    try {
      const { idMessage } = await sendMessage(
        credentials,
        state.selectedId,
        text
      );
      const message: ChatMessage = {
        id: idMessage,
        text,
        fromMe: true,
        at: Date.now()
      };
      dispatch({
        type: 'send_ok',
        chatId: state.selectedId,
        message
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось отправить сообщение';
      dispatch({ type: 'send_fail', error: message });
    }
  };

  return (
    <Layout $chatOpen={Boolean(selected)}>
      <ChatList
        chats={state.chats}
        metaById={metaById}
        previewById={previewById}
        selectedId={state.selectedId}
        loading={chatsQuery.isLoading}
        error={chatsError}
        onSelect={(id) => dispatch({ type: 'select', id })}
        onAdd={() => dispatch({ type: 'open_add' })}
        onDisconnect={disconnect}
      />

      <ChatPane
        chat={selected}
        meta={selected ? metaById.get(selected.id) : undefined}
        credentials={credentials}
        loading={historyQuery.isLoading}
        historyError={historyError}
        sendError={state.sendError}
        sending={state.sending}
        onBack={() => dispatch({ type: 'select', id: null })}
        onSend={(text) => void send(text)}
      />

      <Show when={state.adding}>
        <AddChatModal
          phone={state.phone}
          error={state.addError}
          onPhoneChange={(phone) => dispatch({ type: 'set_phone', phone })}
          onClose={() => dispatch({ type: 'close_add' })}
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
