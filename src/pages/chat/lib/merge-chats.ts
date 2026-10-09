import type { Chat } from './types';

export function mergeChats(next: Chat[], prev: Chat[]): Chat[] {
  const prevById = new Map(prev.map((chat) => [chat.id, chat]));
  const merged = next.map((chat) => {
    const old = prevById.get(chat.id);
    return old
      ? { ...chat, messages: old.messages, unread: old.unread }
      : chat;
  });

  for (const chat of prev) {
    if (!merged.some((item) => item.id === chat.id)) {
      merged.unshift(chat);
    }
  }

  return merged;
}
