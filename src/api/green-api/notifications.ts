import { methodUrl, quotaOrRateLimitError, readJson } from './http';
import type {
  Credentials,
  NotificationBody,
  NotificationReceipt,
  ParsedNotificationMessage
} from './types';

const MESSAGE_WEBHOOKS = new Set([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'outgoingAPIMessageReceived'
]);

export async function receiveNotification(
  credentials: Credentials,
  options?: { receiveTimeout?: number; signal?: AbortSignal }
) {
  const timeout = options?.receiveTimeout ?? 60;
  const url = `${methodUrl(credentials, 'receiveNotification')}?receiveTimeout=${timeout}`;
  const response = await fetch(url, { signal: options?.signal });

  const limitError = quotaOrRateLimitError(response.status);
  if (limitError) {
    throw limitError;
  }

  if (!response.ok) {
    throw new Error('Не удалось получить уведомление');
  }

  const text = await response.text();
  if (!text.trim() || text.trim() === 'null') {
    return null;
  }

  return JSON.parse(text) as NotificationReceipt;
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number
) {
  const response = await fetch(
    `${methodUrl(credentials, 'deleteNotification')}/${receiptId}`,
    { method: 'DELETE' }
  );
  return readJson<{ result: boolean }>(
    response,
    'Не удалось подтвердить уведомление'
  );
}

export function parseNotificationMessage(
  body: NotificationBody
): ParsedNotificationMessage | null {
  if (!body.typeWebhook || !MESSAGE_WEBHOOKS.has(body.typeWebhook)) {
    return null;
  }

  const chatId = String(body.senderData?.chatId ?? '');
  const idMessage = body.idMessage;
  if (!chatId || !idMessage) {
    return null;
  }

  const text =
    body.messageData?.textMessageData?.textMessage ||
    body.messageData?.extendedTextMessageData?.text ||
    body.messageData?.fileMessageData?.caption ||
    '[медиа]';

  return {
    chatId,
    chatName: body.senderData?.chatName,
    idMessage,
    text,
    fromMe: body.typeWebhook !== 'incomingMessageReceived',
    at: (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000
  };
}
