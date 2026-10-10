import type { ChatListItem, ChatMessage } from '../../../api';

export type { ChatMessage };

export type ChatSummary = ChatListItem & {
  lastMessage?: ChatMessage;
};

export type ChatPreviewState =
  | { status: 'loading' }
  | { status: 'ready'; text: string }
  | { status: 'error' };
