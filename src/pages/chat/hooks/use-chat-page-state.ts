import {
  useCallback,
  useReducer,
  type Dispatch,
  type SetStateAction
} from 'react';
import type { Chat, ChatMessage } from '../lib/types';

type ChatPageState = {
  chats: Chat[];
  selectedId: string | null;
  sending: boolean;
  sendError: string;
  adding: boolean;
  phone: string;
  addError: string;
};

type ChatPageAction =
  | { type: 'patch_chats'; patch: SetStateAction<Chat[]> }
  | { type: 'select'; id: string | null }
  | { type: 'open_add' }
  | { type: 'close_add' }
  | { type: 'set_phone'; phone: string }
  | { type: 'set_add_error'; error: string }
  | { type: 'add_chat'; chat: Chat }
  | { type: 'send_start' }
  | { type: 'send_ok'; chatId: string; message: ChatMessage }
  | { type: 'send_fail'; error: string }
  | { type: 'clear_send_error' };

const initialState: ChatPageState = {
  chats: [],
  selectedId: null,
  sending: false,
  sendError: '',
  adding: false,
  phone: '',
  addError: ''
};

function resolveChats(
  chats: Chat[],
  patch: SetStateAction<Chat[]>
): Chat[] {
  return typeof patch === 'function' ? patch(chats) : patch;
}

function chatPageReducer(
  state: ChatPageState,
  action: ChatPageAction
): ChatPageState {
  switch (action.type) {
    case 'patch_chats':
      return { ...state, chats: resolveChats(state.chats, action.patch) };

    case 'select': {
      const selectedId = action.id;
      if (!selectedId) {
        return { ...state, selectedId: null, sendError: '' };
      }
      return {
        ...state,
        selectedId,
        sendError: '',
        chats: state.chats.map((chat) =>
          chat.id === selectedId && chat.unread > 0
            ? { ...chat, unread: 0 }
            : chat
        )
      };
    }

    case 'open_add':
      return { ...state, adding: true, addError: '', phone: '' };

    case 'close_add':
      return { ...state, adding: false, addError: '', phone: '' };

    case 'set_phone':
      return { ...state, phone: action.phone };

    case 'set_add_error':
      return { ...state, addError: action.error };

    case 'add_chat':
      return {
        ...state,
        chats: state.chats.some((chat) => chat.id === action.chat.id)
          ? state.chats
          : [action.chat, ...state.chats],
        selectedId: action.chat.id,
        adding: false,
        phone: '',
        addError: '',
        sendError: ''
      };

    case 'send_start':
      return { ...state, sending: true, sendError: '' };

    case 'send_ok':
      return {
        ...state,
        sending: false,
        chats: state.chats.map((chat) =>
          chat.id === action.chatId
            ? { ...chat, messages: [...chat.messages, action.message] }
            : chat
        )
      };

    case 'send_fail':
      return { ...state, sending: false, sendError: action.error };

    case 'clear_send_error':
      return { ...state, sendError: '' };

    default:
      return state;
  }
}

export function useChatPageState() {
  const [state, dispatch] = useReducer(chatPageReducer, initialState);

  const setChats = useCallback<Dispatch<SetStateAction<Chat[]>>>(
    (patch) => dispatch({ type: 'patch_chats', patch }),
    []
  );

  return { state, dispatch, setChats };
}
