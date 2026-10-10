import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import { fetchChats, GreenAPI, resetLanes, type Credentials } from '../api';
import { queryErrorMessage } from '../lib/query-error-message';
import { chatsQueryKey } from '../pages/chat/lib/query-keys';
import { queryClient } from '../query-client';
import {
  SessionContext,
  type SessionContextType,
  type SessionState
} from './session-context';

function normalizeCredentials(raw: Partial<Credentials>): Credentials | null {
  const idInstance = raw.idInstance?.trim() ?? '';
  const apiTokenInstance = raw.apiTokenInstance?.trim() ?? '';
  if (!idInstance || !apiTokenInstance) {
    return null;
  }
  return { idInstance, apiTokenInstance };
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SessionState>({ status: 'disconnected' });

  const connect = useCallback(async (credentials: Credentials) => {
    const next = normalizeCredentials(credentials);
    if (!next) {
      setState({ status: 'error', message: 'Заполните все поля' });
      return;
    }

    setState({ status: 'connecting' });
    resetLanes();

    try {
      const stateInstance = await new GreenAPI(next).getStateInstance();
      if (stateInstance !== 'authorized') {
        throw new Error('Инстанс не авторизован');
      }

      setState({ status: 'bootstrapping', credentials: next });

      try {
        await queryClient.fetchQuery({
          queryKey: chatsQueryKey(next),
          queryFn: () => fetchChats(next),
          retry: 2,
          retryDelay: 1500
        });
      } catch {
        // чаты не загрузились — всё равно заходим; ошибка останется в query
      }

      setState({ status: 'connected', credentials: next });
    } catch (error) {
      setState({
        status: 'error',
        message: queryErrorMessage(error, 'Не удалось подключиться к GREEN-API')
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    resetLanes();
    queryClient.clear();
    setState({ status: 'disconnected' });
  }, []);

  const value = useMemo<SessionContextType>(
    () => ({ state, connect, disconnect }),
    [state, connect, disconnect]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
