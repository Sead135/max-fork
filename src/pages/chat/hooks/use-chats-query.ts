import { useQuery } from '@tanstack/react-query';
import { fetchChats, type Credentials } from '../../../api';
import { queryErrorMessage } from '../../../lib/query-error-message';
import { chatsQueryKey } from '../lib/query-keys';

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
