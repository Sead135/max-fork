import { useQuery } from '@tanstack/react-query';
import { mapHistoryMessages, type Credentials } from '../../../api';
import { queryErrorMessage } from '../../../lib';
import { chatHistoryQueryKey, getAPI } from '../lib';

export function useChatHistoryQuery(
  credentials: Credentials | null,
  chatId: string | null
) {
  const api = getAPI(credentials);
  const queryKey =
    credentials && chatId
      ? chatHistoryQueryKey(credentials, chatId)
      : ['chatHistory', 'idle'];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!api || !chatId) {
        return [];
      }

      const history = await api.getChatHistory(chatId, 100, 0);
      return mapHistoryMessages(history);
    },
    enabled: !!(credentials && chatId),
    staleTime: 0
  });

  return {
    ...query,
    errorMessage: queryErrorMessage(
      query.error,
      'Не удалось загрузить историю чата'
    )
  };
}
