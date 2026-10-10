import type { AvatarTextGradient } from '@maxhub/max-ui';
import type { GreenChat, HistoryMessage } from '../../../api';
import { historyMessageText } from '../../../api';

export type ChatMessage = {
  id: string;
  text: string;
  fromMe: boolean;
  at: number;
};

export type Chat = {
  id: string;
  title: string;
  type?: string;
  messages: ChatMessage[];
  unread: number;
};

const GRADIENTS: AvatarTextGradient[] = [
  'red',
  'orange',
  'green',
  'blue',
  'purple'
];

export function phoneToChatId(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits ? `${digits}@c.us` : '';
}

export function chatTitle(chatId: string, name?: string) {
  if (name?.trim()) {
    return name.trim();
  }
  if (chatId.includes('@')) {
    return `+${chatId.replace(/@.+$/, '')}`;
  }
  return chatId;
}

export function fromGreenChat(chat: GreenChat): Chat | null {
  const id = String(chat.chatId ?? chat.id ?? '');
  if (!id) {
    return null;
  }
  return {
    id,
    title: chatTitle(id, chat.name),
    type: chat.type,
    messages: [],
    unread: Math.max(0, chat.unreadCount ?? 0)
  };
}

export function unreadLabel(count: number) {
  if (count <= 0) {
    return null;
  }
  return count > 99 ? '99+' : String(count);
}

export function fromHistoryMessage(message: HistoryMessage): ChatMessage {
  return {
    id: message.idMessage,
    text: historyMessageText(message),
    fromMe: message.type === 'outgoing',
    at: message.timestamp * 1000
  };
}

export function avatarGradient(id: string): AvatarTextGradient {
  const value = String(id ?? '');
  let hash = 0;
  for (const char of value) {
    hash = (hash + char.charCodeAt(0)) % GRADIENTS.length;
  }
  return GRADIENTS[hash] ?? 'blue';
}

export function avatarLetters(title: string) {
  const parts = String(title ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const [firstWord, secondWord] = parts;
  if (firstWord && secondWord) {
    return (firstWord.charAt(0) + secondWord.charAt(0)).toUpperCase();
  }
  const digits = title.replace(/\D/g, '');
  return (digits.slice(-2) || title.slice(0, 2) || '?').toUpperCase();
}
