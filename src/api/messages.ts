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

export function messageTextFromParts(parts: {
  textMessage?: string;
  extendedText?: string;
  caption?: string;
}) {
  return (
    parts.textMessage || parts.extendedText || parts.caption || '[медиа]'
  );
}

function historyMessageText(message: HistoryMessage) {
  return messageTextFromParts({
    textMessage: message.textMessage,
    extendedText: message.extendedTextMessage?.text,
    caption: message.caption
  });
}

export function mapHistoryMessages(history: HistoryMessage[]): ChatMessage[] {
  return [...history].reverse().map((message) => ({
    id: message.idMessage,
    text: historyMessageText(message),
    fromMe: message.type === 'outgoing',
    at: message.timestamp * 1000
  }));
}
