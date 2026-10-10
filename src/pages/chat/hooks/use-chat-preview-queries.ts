import { useQueries } from '@tanstack/react-query';
import { mapHistoryMessages, type Credentials } from '../../../api';
import { getAPI } from '../lib';
import { chatPreviewQueryKey } from '../lib/query-keys';
import type { ChatPreviewState, ChatSummary } from '../lib/types';

export function useChatPreviewMap(
  credentials: Credentials | null,
  chats: ChatSummary[]
) {
  const api = getAPI(credentials);

  const results = useQueries({
    queries: chats.map((chat) => {
      const queryKey = credentials
        ? chatPreviewQueryKey(credentials, chat.id)
        : ['chatPreview', 'idle', chat.id];

      return {
        queryKey,
        queryFn: async () => {
          if (!api) {
            return '';
          }

          const history = await api.getChatHistory(chat.id, 1, 1);
          const last = mapHistoryMessages(history).at(-1);
          return last?.text ?? '';
        },
        enabled: !!credentials && !chat.lastMessage,
        staleTime: 10 * 60_000,
        retry: false
      };
    })
  });

  const map = new Map<string, ChatPreviewState>();
  chats.forEach((chat, index) => {
    if (chat.lastMessage) {
      map.set(chat.id, {
        status: 'ready',
        text: chat.lastMessage.text
      });
      return;
    }
    const result = results[index];
    if (!result || result.isPending) {
      map.set(chat.id, { status: 'loading' });
      return;
    }
    if (result.isError) {
      map.set(chat.id, { status: 'ready', text: '' });
      return;
    }
    map.set(chat.id, {
      status: 'ready',
      text: typeof result.data === 'string' ? result.data : ''
    });
  });

  return map;
}
