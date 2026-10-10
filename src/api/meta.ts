import type { ChatMeta, ContactInfo, GroupData } from './types';

const ruPlural = new Intl.PluralRules('ru');
const lastSeenFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
});

export function isGroupLikeChat(type?: string, chatId?: string) {
  return type === 'group' || type === 'channel' || !!chatId?.startsWith('-');
}

export function participantsLabel(size: number) {
  const form = ruPlural.select(size);
  if (form === 'one') {
    return `${size} участник`;
  }
  if (form === 'few') {
    return `${size} участника`;
  }
  return `${size} участников`;
}

export function groupToChatMeta(
  chatId: string,
  group: GroupData,
  type?: string
): ChatMeta {
  const title = group.subject?.trim() || chatId;
  const subtitle =
    typeof group.size === 'number' ? participantsLabel(group.size) : undefined;
  return {
    chatId,
    kind: 'group',
    title,
    avatar: group.urlAvatar?.trim() || undefined,
    description: group.description?.trim() || undefined,
    chatType: group.type || type,
    size: group.size,
    inviteLink: group.groupInviteLink?.trim() || undefined,
    subtitle
  };
}

export function contactToChatMeta(
  chatId: string,
  contact: ContactInfo,
  type?: string
): ChatMeta {
  const title = contact.contactName?.trim() || contact.name?.trim() || chatId;
  const raw = contact.lastSeen;
  let lastSeen: number | null = null;
  if (raw != null && raw !== '') {
    const ts = typeof raw === 'string' ? Number(raw) : raw;
    lastSeen = Number.isFinite(ts) && ts > 0 ? ts : null;
  }
  const subtitle = lastSeen
    ? `был(а) ${lastSeenFormatter.format(new Date(lastSeen * 1000))}`
    : undefined;

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
    subtitle
  };
}
