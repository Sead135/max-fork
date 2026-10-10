import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type Credentials } from '../../../api';
import { getAPI } from '../lib';
import { chatsQueryKey, chatHistoryQueryKey } from '../lib/query-keys';
import type { ChatMessage, ChatSummary } from '../lib/types';

export function useSendMessage(
  credentials: Credentials | null,
  chatId: string | null
) {
  const api = getAPI(credentials);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!api || !chatId) {
        throw new Error('Нет активного чата');
      }
      const { idMessage } = await api.sendMessage(chatId, text);
      return {
        id: idMessage,
        text,
        fromMe: true,
        at: Date.now()
      } satisfies ChatMessage;
    },
    onSuccess: (message) => {
      if (!credentials || !chatId) {
        return;
      }

      queryClient.setQueryData<ChatMessage[]>(
        chatHistoryQueryKey(credentials, chatId),
        (prev) => (prev ? [...prev, message] : [message])
      );

      queryClient.setQueryData<ChatSummary[]>(
        chatsQueryKey(credentials),
        (prev) =>
          prev?.map((chat) =>
            chat.id === chatId ? { ...chat, lastMessage: message } : chat
          )
      );
    }
  });
}
