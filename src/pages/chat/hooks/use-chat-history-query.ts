import { useQuery } from '@tanstack/react-query';
import {
  chatHistoryQueryKey,
  getChatHistory,
  type Credentials
} from '../../../api/green-api';
import { fromHistoryMessage } from '../lib/types';

export function useChatHistoryQuery(
  credentials: Credentials | null,
  chatId: string | null
) {
  const key =
    credentials && chatId
      ? chatHistoryQueryKey(credentials, chatId)
      : ['chatHistory', 'idle'];

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const history = await getChatHistory(credentials!, chatId!);
      return [...history].reverse().map(fromHistoryMessage);
    },
    enabled: Boolean(credentials && chatId),
    staleTime: 0
  });
}
