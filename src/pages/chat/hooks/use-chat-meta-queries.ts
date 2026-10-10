import { useQueries, useQuery } from '@tanstack/react-query';
import {
  isMetaQuotaBlocked,
  type ChatMeta,
  type Credentials
} from '../../../api';
import { chatMetaQueryKey, getAPI } from '../lib';

export function useChatMeta(
  credentials: Credentials | null,
  chatId: string | null,
  type?: string
) {
  const api = getAPI(credentials);
  const queryKey =
    credentials && chatId
      ? chatMetaQueryKey(credentials, chatId)
      : ['chatMeta', 'idle'];

  return useQuery({
    queryKey,
    queryFn: () => {
      if (!api || !chatId) {
        return null;
      }

      return api.getChatMeta(chatId, type);
    },
    enabled: !!(credentials && chatId) && !isMetaQuotaBlocked(),
    staleTime: 10 * 60_000,
    retry: false
  });
}

export function useChatMetaMap(
  credentials: Credentials | null,
  chats: Array<{ id: string; type?: string }>
) {
  const api = getAPI(credentials);
  const blocked = isMetaQuotaBlocked();
  const results = useQueries({
    queries: chats.map((chat) => {
      const queryKey = credentials
        ? chatMetaQueryKey(credentials, chat.id)
        : ['chatMeta', 'idle', chat.id];

      return {
        queryKey,
        queryFn: () => {
          if (!api || !chat.id) {
            return null;
          }

          return api.getChatMeta(chat.id, chat.type);
        },
        enabled: !!credentials && !blocked,
        staleTime: 10 * 60_000,
        retry: false
      };
    })
  });

  const map = new Map<string, ChatMeta>();
  chats.forEach((chat, index) => {
    const data = results[index]?.data;
    if (data) {
      map.set(chat.id, data);
    }
  });

  return map;
}
