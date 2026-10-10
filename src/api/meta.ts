import { getChatHistory, historyMessageText } from './chats';
import {
  fetchWithRetry,
  isQuotaError,
  methodUrl,
  readJson,
  sleep
} from './http';
import type {
  ChatMeta,
  ContactInfo,
  Credentials,
  GroupData
} from './types';

const META_GAP_MS = 500;
const ruPlural = new Intl.PluralRules('ru');
const lastSeenFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
});

type Lane = { tail: Promise<unknown> };
const metaLane: Lane = { tail: Promise.resolve() };
const previewLane: Lane = { tail: Promise.resolve() };
let metaQuotaError: Error | null = null;

async function enqueue<T>(
  lane: Lane,
  task: () => Promise<T>,
  killOnQuota = false
): Promise<T> {
  if (killOnQuota && metaQuotaError) {
    throw metaQuotaError;
  }

  const run = lane.tail.then(async () => {
    if (killOnQuota && metaQuotaError) {
      throw metaQuotaError;
    }
    try {
      return await task();
    } catch (error) {
      if (killOnQuota && isQuotaError(error)) {
        metaQuotaError = error;
      }
      throw error;
    } finally {
      if (!(killOnQuota && metaQuotaError)) {
        await sleep(META_GAP_MS);
      }
    }
  }) as Promise<T>;

  lane.tail = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function isGroupLikeChat(type?: string, chatId?: string) {
  if (type === 'group' || type === 'channel') {
    return true;
  }
  if (chatId?.startsWith('-')) {
    return true;
  }
  return false;
}

export async function getContactInfo(credentials: Credentials, chatId: string) {
  const response = await fetchWithRetry(
    methodUrl(credentials, 'getContactInfo'),
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

export async function getGroupData(credentials: Credentials, chatId: string) {
  const response = await fetchWithRetry(
    methodUrl(credentials, 'getGroupData'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId })
    }
  );
  return readJson<GroupData>(response, 'Не удалось загрузить данные группы');
}

function toLastSeen(value: ContactInfo['lastSeen']): number | null {
  if (value == null || value === '') {
    return null;
  }
  const ts = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(ts) && ts > 0 ? ts : null;
}

function participantsLabel(size: number) {
  const form = ruPlural.select(size);
  const word =
    form === 'one' ? 'участник' : form === 'few' ? 'участника' : 'участников';
  return `${size} ${word}`;
}

function formatLastSeenLabel(ts: number) {
  return lastSeenFormatter.format(new Date(ts * 1000));
}

export async function fetchChatMeta(
  credentials: Credentials,
  chatId: string,
  type?: string
): Promise<ChatMeta> {
  return enqueue(metaLane, async () => {
    if (isGroupLikeChat(type, chatId)) {
      const group = await getGroupData(credentials, chatId);
      const title = group.subject?.trim() || chatId;
      return {
        chatId,
        kind: 'group',
        title,
        avatar: group.urlAvatar?.trim() || undefined,
        description: group.description?.trim() || undefined,
        chatType: group.type || type,
        size: group.size,
        inviteLink: group.groupInviteLink?.trim() || undefined,
        subtitle:
          typeof group.size === 'number'
            ? participantsLabel(group.size)
            : undefined
      };
    }

    const contact = await getContactInfo(credentials, chatId);
    const title =
      contact.contactName?.trim() || contact.name?.trim() || chatId;
    const lastSeen = toLastSeen(contact.lastSeen);

    return {
      chatId,
      kind: 'contact',
      title,
      avatar: contact.avatar?.trim() || undefined,
      name: contact.name?.trim() || undefined,
      contactName: contact.contactName?.trim() || undefined,
      chatType: contact.chatType || type,
      phoneNumber: contact.phoneNumber,
      lastSeen,
      subtitle: lastSeen
        ? `был(а) ${formatLastSeenLabel(lastSeen)}`
        : undefined
    };
  }, true);
}

export async function fetchChatPreview(
  credentials: Credentials,
  chatId: string
): Promise<string> {
  return enqueue(previewLane, async () => {
    const history = await getChatHistory(credentials, chatId, 1);
    const last = history[0];
    return last ? historyMessageText(last) : '';
  });
}

export function chatMetaQueryKey(credentials: Credentials, chatId: string) {
  return [
    'chatMeta',
    credentials.idInstance,
    credentials.apiTokenInstance,
    chatId
  ] as const;
}

export function chatPreviewQueryKey(credentials: Credentials, chatId: string) {
  return [
    'chatPreview',
    credentials.idInstance,
    credentials.apiTokenInstance,
    chatId
  ] as const;
}
