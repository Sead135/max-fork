import { useQueries, useQuery } from '@tanstack/react-query';
import {
  chatMetaQueryKey,
  chatPreviewQueryKey,
  fetchChatMeta,
  fetchChatPreview,
  type ChatMeta,
  type Credentials
} from '../../../api/green-api';

export function useChatMeta(
  credentials: Credentials | null,
  chatId: string | null,
  type?: string
) {
  return useQuery({
    queryKey:
      credentials && chatId
        ? chatMetaQueryKey(credentials, chatId)
        : ['chatMeta', 'idle'],
    queryFn: () => fetchChatMeta(credentials!, chatId!, type),
    enabled: Boolean(credentials && chatId),
    staleTime: 10 * 60_000,
    retry: false
  });
}

export function useChatsMetaMap(
  credentials: Credentials | null,
  chats: Array<{ id: string; type?: string }>
) {
  const results = useQueries({
    queries: chats.map((chat) => ({
      queryKey: credentials
        ? chatMetaQueryKey(credentials, chat.id)
        : ['chatMeta', 'idle', chat.id],
      queryFn: () => fetchChatMeta(credentials!, chat.id, chat.type),
      enabled: Boolean(credentials),
      staleTime: 10 * 60_000,
      retry: false
    }))
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

export type ChatPreviewState =
  | { status: 'loading' }
  | { status: 'ready'; text: string };

export function useChatsPreviewMap(
  credentials: Credentials | null,
  chats: Array<{ id: string; messages: unknown[] }>
) {
  const results = useQueries({
    queries: chats.map((chat) => ({
      queryKey: credentials
        ? chatPreviewQueryKey(credentials, chat.id)
        : ['chatPreview', 'idle', chat.id],
      queryFn: () => fetchChatPreview(credentials!, chat.id),
      enabled: Boolean(credentials) && chat.messages.length === 0,
      staleTime: 10 * 60_000,
      retry: false
    }))
  });

  const map = new Map<string, ChatPreviewState>();
  chats.forEach((chat, index) => {
    if (chat.messages.length > 0) {
      return;
    }
    const result = results[index];
    if (!result) {
      map.set(chat.id, { status: 'loading' });
      return;
    }
    if (typeof result.data === 'string') {
      map.set(chat.id, { status: 'ready', text: result.data });
      return;
    }
    if (result.isError) {
      map.set(chat.id, { status: 'ready', text: '' });
      return;
    }
    map.set(chat.id, { status: 'loading' });
  });

  return map;
}

export function isRecentlyOnline(lastSeen?: number | null) {
  if (!lastSeen) {
    return false;
  }
  return Date.now() / 1000 - lastSeen < 5 * 60;
}
