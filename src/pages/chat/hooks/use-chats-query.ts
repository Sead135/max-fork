import { useQuery } from '@tanstack/react-query';
import { chatsQueryKey, getChats, type Credentials } from '../../../api/green-api';
import { fromGreenChat } from '../lib/types';

export function useChatsQuery(credentials: Credentials | null) {
  return useQuery({
    queryKey: credentials ? chatsQueryKey(credentials) : ['chats', 'idle'],
    queryFn: async () => {
      const data = await getChats(credentials!);
      return data.map(fromGreenChat).filter((chat) => chat !== null);
    },
    enabled: Boolean(credentials),
    staleTime: 5 * 60_000
  });
}
