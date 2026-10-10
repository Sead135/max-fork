import type { ChatMessage, HistoryMessage } from './types';

const IMAGE_TYPES = new Set(['imageMessage', 'stickerMessage']);

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
    parts.textMessage?.trim() ||
    parts.extendedText?.trim() ||
    parts.caption?.trim() ||
    ''
  );
}

export function imageUrlFromMedia(parts: {
  typeMessage?: string;
  downloadUrl?: string;
  mimeType?: string;
}) {
  const url = parts.downloadUrl?.trim();
  if (!url) {
    return undefined;
  }
  if (parts.typeMessage && IMAGE_TYPES.has(parts.typeMessage)) {
    return url;
  }
  if (parts.mimeType?.startsWith('image/')) {
    return url;
  }
  return undefined;
}

export function mapHistoryMessages(history: HistoryMessage[]): ChatMessage[] {
  return [...history].reverse().map((message) => {
    const imageUrl = imageUrlFromMedia({
      typeMessage: message.typeMessage,
      downloadUrl: message.downloadUrl,
      mimeType: message.mimeType
    });
    const text =
      messageTextFromParts({
        textMessage: message.textMessage,
        extendedText: message.extendedTextMessage?.text,
        caption: message.caption
      }) || (imageUrl ? '' : '[медиа]');

    return {
      id: message.idMessage,
      text,
      fromMe: message.type === 'outgoing',
      at: message.timestamp * 1000,
      imageUrl
    };
  });
}
