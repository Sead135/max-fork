import type { QueryClient } from '@tanstack/react-query';
import {
  chatTitle,
  type Credentials,
  type ParsedNotificationMessage
} from '../../../api';
import { chatHistoryQueryKey, chatsQueryKey } from './query-keys';
import type { ChatMessage, ChatSummary } from './types';

function toMessage(parsed: ParsedNotificationMessage): ChatMessage {
  return {
    id: parsed.idMessage,
    text: parsed.text,
    fromMe: parsed.fromMe,
    at: parsed.at
  };
}

function mergeChatList(
  list: ChatSummary[],
  parsed: ParsedNotificationMessage,
  message: ChatMessage,
  selected: string | null
): ChatSummary[] {
  const index = list.findIndex((chat) => chat.id === parsed.chatId);

  if (index < 0) {
    return [
      {
        id: parsed.chatId,
        title: chatTitle(parsed.chatId, parsed.chatName),
        unread: !parsed.fromMe && parsed.chatId !== selected ? 1 : 0,
        lastMessage: message
      },
      ...list
    ];
  }

  return list.map((chat, i) => {
    if (i !== index) {
      return chat;
    }
    let unread = chat.unread;
    if (parsed.chatId === selected) {
      unread = 0;
    } else if (!parsed.fromMe) {
      unread += 1;
    }
    return {
      ...chat,
      title: parsed.chatName?.trim() || chat.title,
      unread,
      lastMessage: message
    };
  });
}

function appendUniqueMessage(
  prev: ChatMessage[] | undefined,
  message: ChatMessage
): ChatMessage[] {
  if (!prev) {
    return [message];
  }
  if (prev.some(({ id }) => id === message.id)) {
    return prev;
  }
  return [...prev, message];
}

export function applyNotificationMessage(
  queryClient: QueryClient,
  credentials: Credentials,
  parsed: ParsedNotificationMessage,
  selected: string | null
) {
  const message = toMessage(parsed);

  queryClient.setQueryData<ChatSummary[]>(chatsQueryKey(credentials), (prev) =>
    mergeChatList(prev ?? [], parsed, message, selected)
  );

  if (parsed.chatId === selected) {
    queryClient.setQueryData<ChatMessage[]>(
      chatHistoryQueryKey(credentials, parsed.chatId),
      (prev) => appendUniqueMessage(prev, message)
    );
  }
}
