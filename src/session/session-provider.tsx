import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';
import {
  getStateInstance,
  normalizeCredentials,
  type Credentials
} from '../api';
import { queryErrorMessage } from '../lib/query-error-message';
import {
  SessionContext,
  type SessionContextType,
  type SessionState
} from './session-context';

export function SessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SessionState>({ status: 'disconnected' });

  const connect = useCallback(async (credentials: Credentials) => {
    const next = normalizeCredentials(credentials);
    if (!next) {
      setState({ status: 'error', message: 'Заполните все поля' });
      return;
    }

    setState({ status: 'connecting' });

    try {
      const stateInstance = await getStateInstance(next);

      if (stateInstance !== 'authorized') {
        throw new Error('Инстанс не авторизован');
      }

      setState({ status: 'connected', credentials: next });
    } catch (error) {
      setState({
        status: 'error',
        message: queryErrorMessage(
          error,
          'Не удалось подключиться к GREEN-API'
        )
      });
    }
  }, []);

  const disconnect = useCallback(() => {
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
