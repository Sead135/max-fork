import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import {
  deleteNotification,
  parseNotificationMessage,
  receiveNotification,
  type Credentials,
  type ParsedNotificationMessage
} from '../../../api';
import { chatTitle, type Chat, type ChatMessage } from '../lib/types';

const RECEIVE_TIMEOUT_SEC = 5;
const RETRY_DELAY_MS = 5_000;

function applyNotification(
  chats: Chat[],
  parsed: ParsedNotificationMessage,
  selectedId: string | null
): Chat[] {
  const message: ChatMessage = {
    id: parsed.idMessage,
    text: parsed.text,
    fromMe: parsed.fromMe,
    at: parsed.at
  };

  const existing = chats.find(({ id }) => id === parsed.chatId);

  if (!existing) {
    return [
      {
        id: parsed.chatId,
        title: chatTitle(parsed.chatId, parsed.chatName),
        messages: [message],
        unread: !parsed.fromMe && parsed.chatId !== selectedId ? 1 : 0
      },
      ...chats
    ];
  }

  const alreadyHas = existing.messages.some(({ id }) => id === message.id);
  let unread = existing.unread;
  if (parsed.chatId === selectedId) {
    unread = 0;
  } else if (!parsed.fromMe && !alreadyHas) {
    unread += 1;
  }

  const updated: Chat = {
    ...existing,
    title: parsed.chatName?.trim() || existing.title,
    messages: alreadyHas ? existing.messages : [...existing.messages, message],
    unread
  };

  return [updated, ...chats.filter(({ id }) => id !== parsed.chatId)];
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

export function useNotifications(
  credentials: Credentials | null,
  selectedId: string | null,
  setChats: Dispatch<SetStateAction<Chat[]>>
) {
  const selectedRef = useRef(selectedId);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!credentials) {
      return;
    }

    const controller = new AbortController();

    const loop = async () => {
      while (!controller.signal.aborted) {
        try {
          const receipt = await receiveNotification(credentials, {
            receiveTimeout: RECEIVE_TIMEOUT_SEC,
            signal: controller.signal
          });

          if (!receipt) {
            await sleep(RETRY_DELAY_MS, controller.signal);
            continue;
          }

          const parsed = parseNotificationMessage(receipt.body);
          if (parsed) {
            setChats((prev) =>
              applyNotification(prev, parsed, selectedRef.current)
            );
          }

          await deleteNotification(credentials, receipt.receiptId);
        } catch (error) {
          if (controller.signal.aborted) {
            break;
          }
          if (error instanceof DOMException && error.name === 'AbortError') {
            break;
          }
          try {
            await sleep(RETRY_DELAY_MS, controller.signal);
          } catch {
            break;
          }
        }
      }
    };

    void loop();

    return () => {
      controller.abort();
    };
  }, [credentials, setChats]);
}
