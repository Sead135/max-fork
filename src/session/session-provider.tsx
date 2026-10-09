import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren
} from 'react';
import { getStateInstance, type Credentials } from '../api/green-api';

type SessionState =
  | { status: 'disconnected' }
  | { status: 'connecting' }
  | { status: 'connected'; credentials: Credentials }
  | { status: 'error'; message: string };

type SessionContextType = {
  state: SessionState;
  connect: (credentials: Credentials) => Promise<void>;
  disconnect: () => void;
};

const SessionContext = createContext<SessionContextType | null>(null);

const DEV_STORAGE_KEY = 'max-fork:green-api-credentials';

function readDevCredentials(): Credentials | null {
  if (!import.meta.env.DEV) {
    return null;
  }
  try {
    const raw = localStorage.getItem(DEV_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<Credentials>;
    if (!parsed.idInstance?.trim() || !parsed.apiTokenInstance?.trim()) {
      return null;
    }
    return {
      idInstance: parsed.idInstance.trim(),
      apiTokenInstance: parsed.apiTokenInstance.trim()
    };
  } catch {
    return null;
  }
}

function writeDevCredentials(credentials: Credentials) {
  if (!import.meta.env.DEV) {
    return;
  }
  localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(credentials));
}

function clearDevCredentials() {
  if (!import.meta.env.DEV) {
    return;
  }
  localStorage.removeItem(DEV_STORAGE_KEY);
}

function initialSessionState(): SessionState {
  const credentials = readDevCredentials();
  return credentials
    ? { status: 'connected', credentials }
    : { status: 'disconnected' };
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SessionState>(initialSessionState);

  const connect = useCallback(async (credentials: Credentials) => {
    const idInstance = credentials.idInstance.trim();
    const apiTokenInstance = credentials.apiTokenInstance.trim();

    if (!idInstance || !apiTokenInstance) {
      setState({ status: 'error', message: 'Заполните все поля' });
      return;
    }

    setState({ status: 'connecting' });

    try {
      const next = { idInstance, apiTokenInstance };
      const stateInstance = await getStateInstance(next);

      if (stateInstance !== 'authorized') {
        throw new Error('Инстанс не авторизован');
      }

      writeDevCredentials(next);
      setState({ status: 'connected', credentials: next });
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Не удалось подключиться к GREEN-API'
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    clearDevCredentials();
    setState({ status: 'disconnected' });
  }, []);

  return (
    <SessionContext.Provider value={{ state, connect, disconnect }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession вне SessionProvider');
  }

  return context;
}
