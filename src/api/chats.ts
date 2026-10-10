import { GreenAPI } from './green-api';
import { chatTitle } from './messages';
import type { Credentials, GreenChat } from './types';

export type ChatListItem = {
  id: string;
  title: string;
  type?: string;
  unread: number;
};

function chatFromGreen(chat: GreenChat): ChatListItem | null {
  const id = String(chat.chatId ?? chat.id ?? '');
  if (!id) {
    return null;
  }
  return {
    id,
    title: chatTitle(id, chat.name),
    type: chat.type,
    unread: Math.max(0, chat.unreadCount ?? 0)
  };
}

export async function fetchChats(
  credentials: Credentials
): Promise<ChatListItem[]> {
  const chats = await new GreenAPI(credentials).getChats();
  const items: ChatListItem[] = [];
  for (const chat of chats) {
    const item = chatFromGreen(chat);
    if (item) {
      items.push(item);
    }
  }
  return items;
}
