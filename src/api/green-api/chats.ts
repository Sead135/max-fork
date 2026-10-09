import { fetchWithRetry, methodUrl, readJson } from './http';
import type { Credentials, GreenChat, HistoryMessage } from './types';

export async function getStateInstance(credentials: Credentials) {
  const response = await fetchWithRetry(
    methodUrl(credentials, 'getStateInstance')
  );
  const data = await readJson<{ stateInstance: string }>(
    response,
    'Не удалось проверить подключение к GREEN-API'
  );
  return data.stateInstance;
}

export async function getChats(credentials: Credentials) {
  const response = await fetchWithRetry(methodUrl(credentials, 'getChats'));
  return readJson<GreenChat[]>(response, 'Не удалось загрузить чаты');
}

export async function getChatHistory(
  credentials: Credentials,
  chatId: string,
  count = 100
) {
  const response = await fetchWithRetry(
    methodUrl(credentials, 'getChatHistory'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, count })
    }
  );
  return readJson<HistoryMessage[]>(
    response,
    'Не удалось загрузить историю чата'
  );
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string
) {
  const response = await fetchWithRetry(methodUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message })
  });
  return readJson<{ idMessage: string }>(
    response,
    'Не удалось отправить сообщение'
  );
}

export function historyMessageText(message: HistoryMessage) {
  if (message.textMessage) {
    return message.textMessage;
  }

  if (message.extendedTextMessage?.text) {
    return message.extendedTextMessage.text;
  }

  if (message.caption) {
    return message.caption;
  }

  return '[медиа]';
}

export function chatsQueryKey(credentials: Credentials) {
  return [
    'chats',
    credentials.idInstance,
    credentials.apiTokenInstance
  ] as const;
}

export function chatHistoryQueryKey(
  credentials: Credentials,
  chatId: string,
  count = 100
) {
  return [
    'chatHistory',
    credentials.idInstance,
    credentials.apiTokenInstance,
    chatId,
    count
  ] as const;
}
