import { useQuery } from '@tanstack/react-query';
import { GreenAPI, type Credentials } from '../../../api';
import { queryErrorMessage } from '../../../lib/query-error-message';
import { chatsQueryKey } from '../lib/query-keys';
import { fromGreenChat, type ChatSummary } from '../lib/types';

export async function fetchChats(
  credentials: Credentials
): Promise<ChatSummary[]> {
  const chats = await new GreenAPI(credentials).getChats();
  const summaries: ChatSummary[] = [];
  for (const chat of chats) {
    const summary = fromGreenChat(chat);
    if (summary) {
      summaries.push(summary);
    }
  }
  return summaries;
}

export function useChatsQuery(credentials: Credentials | null) {
  const query = useQuery({
    queryKey: credentials ? chatsQueryKey(credentials) : ['chats', 'idle'],
    queryFn: () => {
      if (!credentials) {
        return null;
      }
      return fetchChats(credentials);
    },
    enabled: !!credentials
  });

  return {
    ...query,
    errorMessage: queryErrorMessage(query.error, 'Не удалось загрузить чаты')
  };
}
