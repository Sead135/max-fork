import { createContext, useContext } from 'react';
import type { Credentials } from '../api';

export type SessionState =
  | { status: 'disconnected' }
  | { status: 'connecting' }
  | { status: 'bootstrapping'; credentials: Credentials }
  | { status: 'connected'; credentials: Credentials }
  | { status: 'error'; message: string };

export type SessionContextType = {
  state: SessionState;
  connect: (credentials: Credentials) => Promise<void>;
  disconnect: () => void;
};

export const SessionContext = createContext<SessionContextType | null>(null);

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession вне SessionProvider');
  }

  return context;
}
