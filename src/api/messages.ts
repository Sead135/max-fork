import type { ChatMessage, HistoryMessage } from './types';

export function chatTitle(chatId: string, name?: string) {
  if (name?.trim()) {
    return name.trim();
  }
  if (chatId.includes('@')) {
    return `+${chatId.replace(/@.+$/, '')}`;
  }
  return chatId;
}

function historyMessageText(message: HistoryMessage) {
  return (
    message.textMessage ||
    message.extendedTextMessage?.text ||
    message.caption ||
    '[медиа]'
  );
}

export function mapHistoryMessages(history: HistoryMessage[]): ChatMessage[] {
  return [...history].reverse().map((message) => ({
    id: message.idMessage,
    text: historyMessageText(message),
    fromMe: message.type === 'outgoing',
    at: message.timestamp * 1000
  }));
}
