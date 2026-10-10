import type { Credentials } from '../../../api';

export function chatsQueryKey(credentials: Credentials) {
  return ['chats', credentials.idInstance] as const;
}

export function chatPreviewQueryKey(credentials: Credentials, chatId: string) {
  return ['chatPreview', credentials.idInstance, chatId] as const;
}

export function chatHistoryQueryKey(credentials: Credentials, chatId: string) {
  return ['chatHistory', credentials.idInstance, chatId] as const;
}

export function chatMetaQueryKey(credentials: Credentials, chatId: string) {
  return ['chatMeta', credentials.idInstance, chatId] as const;
}
