export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
};

export type ChatMessage = {
  id: string;
  text: string;
  fromMe: boolean;
  at: number;
};

export type GreenChat = {
  chatId?: string | number;
  id?: string | number;
  name?: string;
  type?: string;
  phoneNumber?: number;
  unreadCount?: number;
};

export type HistoryMessage = {
  type: 'incoming' | 'outgoing';
  idMessage: string;
  timestamp: number;
  typeMessage: string;
  textMessage?: string;
  caption?: string;
  extendedTextMessage?: { text?: string };
};

export type ContactInfo = {
  avatar?: string;
  name?: string;
  contactName?: string;
  chatId?: string;
  chatType?: string;
  lastSeen?: number | string | null;
  phoneNumber?: number;
  phoneNumberTimestamp?: number;
};

export type GroupData = {
  chatId?: string;
  type?: string;
  owner?: string;
  subject?: string;
  description?: string;
  creation?: number;
  groupInviteLink?: string;
  urlAvatar?: string;
  size?: number;
  isOfficial?: boolean;
};

export type ChatMeta = {
  chatId: string;
  kind: 'contact' | 'group';
  title: string;
  avatar?: string;
  subtitle?: string;
  description?: string;
  name?: string;
  contactName?: string;
  chatType?: string;
  phoneNumber?: number;
  lastSeen?: number | null;
  size?: number;
  inviteLink?: string;
};

export type NotificationBody = {
  typeWebhook?: string;
  timestamp?: number;
  idMessage?: string;
  senderData?: {
    chatId?: string | number;
    chatName?: string;
  };
  messageData?: {
    typeMessage?: string;
    textMessageData?: { textMessage?: string };
    extendedTextMessageData?: { text?: string };
    fileMessageData?: { caption?: string };
  };
};

export type NotificationReceipt = {
  receiptId: number;
  body: NotificationBody;
};

export type ParsedNotificationMessage = {
  chatId: string;
  chatName?: string;
  idMessage: string;
  text: string;
  fromMe: boolean;
  at: number;
};
