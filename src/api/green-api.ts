import { methodUrl, quotaOrRateLimitError, readJson } from './http';
import { enqueueHistory, enqueueMeta } from './lanes';
import { imageUrlFromMedia, messageTextFromParts } from './messages';
import { contactToChatMeta, groupToChatMeta, isGroupLikeChat } from './meta';
import type {
  ChatMeta,
  ContactInfo,
  Credentials,
  GreenChat,
  GroupData,
  HistoryMessage,
  NotificationBody,
  NotificationReceipt,
  ParsedNotificationMessage
} from './types';

const MESSAGE_WEBHOOKS = new Set([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'outgoingAPIMessageReceived'
]);

export class GreenAPI {
  readonly credentials: Credentials;

  constructor(credentials: Credentials) {
    this.credentials = credentials;
  }

  async getStateInstance() {
    const response = await fetch(
      methodUrl(this.credentials, 'getStateInstance')
    );
    const data = await readJson<{ stateInstance: string }>(
      response,
      'Не удалось проверить подключение к GREEN-API'
    );
    return data.stateInstance;
  }

  async getChats() {
    const response = await fetch(methodUrl(this.credentials, 'getChats'));
    return readJson<GreenChat[]>(response, 'Не удалось загрузить чаты');
  }

  getChatHistory(chatId: string, count = 100, priority = 1) {
    return enqueueHistory(async () => {
      const response = await fetch(
        methodUrl(this.credentials, 'getChatHistory'),
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
    }, priority);
  }

  async sendMessage(chatId: string, message: string) {
    const response = await fetch(methodUrl(this.credentials, 'sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message })
    });
    return readJson<{ idMessage: string }>(
      response,
      'Не удалось отправить сообщение'
    );
  }

  async getContactInfo(chatId: string) {
    const response = await fetch(
      methodUrl(this.credentials, 'getContactInfo'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
      }
    );
    return readJson<ContactInfo>(
      response,
      'Не удалось загрузить профиль контакта'
    );
  }

  async getGroupData(chatId: string) {
    const response = await fetch(methodUrl(this.credentials, 'getGroupData'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId })
    });
    return readJson<GroupData>(response, 'Не удалось загрузить данные группы');
  }

  getChatMeta(chatId: string, type?: string): Promise<ChatMeta> {
    return enqueueMeta(async () => {
      if (isGroupLikeChat(type, chatId)) {
        const group = await this.getGroupData(chatId);
        return groupToChatMeta(chatId, group, type);
      }
      const contact = await this.getContactInfo(chatId);
      return contactToChatMeta(chatId, contact, type);
    });
  }

  async receiveNotification(options?: {
    receiveTimeout?: number;
    signal?: AbortSignal;
  }) {
    const timeout = options?.receiveTimeout ?? 60;
    const url = `${methodUrl(this.credentials, 'receiveNotification')}?receiveTimeout=${timeout}`;
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

  async deleteNotification(receiptId: number) {
    const response = await fetch(
      `${methodUrl(this.credentials, 'deleteNotification')}/${receiptId}`,
      { method: 'DELETE' }
    );
    return readJson<{ result: boolean }>(
      response,
      'Не удалось подтвердить уведомление'
    );
  }

  parseNotification(body: NotificationBody): ParsedNotificationMessage | null {
    if (!body.typeWebhook || !MESSAGE_WEBHOOKS.has(body.typeWebhook)) {
      return null;
    }
    const chatId = String(body.senderData?.chatId ?? '');
    const idMessage = body.idMessage;
    if (!chatId || !idMessage) {
      return null;
    }
    const file = body.messageData?.fileMessageData;
    const imageUrl = imageUrlFromMedia({
      typeMessage: body.messageData?.typeMessage,
      downloadUrl: file?.downloadUrl,
      mimeType: file?.mimeType
    });
    const text =
      messageTextFromParts({
        textMessage: body.messageData?.textMessageData?.textMessage,
        extendedText: body.messageData?.extendedTextMessageData?.text,
        caption: file?.caption
      }) || (imageUrl ? '' : '[медиа]');

    return {
      chatId,
      chatName: body.senderData?.chatName,
      idMessage,
      text,
      fromMe: body.typeWebhook !== 'incomingMessageReceived',
      at: (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
      imageUrl
    };
  }
}
