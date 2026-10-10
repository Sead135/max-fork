import styled from 'styled-components';
import { plainMessagePreview } from '../lib/plain-message-preview';
import type { Chat } from '../lib/types';
import type { ChatPreviewState } from '../hooks/use-chat-meta';

type Props = {
  chat: Chat;
  preview?: ChatPreviewState;
};

export function ChatListCaption({ chat, preview }: Props) {
  const live = chat.messages.at(-1)?.text;
  if (live) {
    return <CaptionText>{plainMessagePreview(live)}</CaptionText>;
  }

  if (!preview || preview.status === 'loading') {
    return <CaptionSkeleton aria-hidden />;
  }

  if (!preview.text) {
    return <CaptionText>Нет сообщений</CaptionText>;
  }

  return <CaptionText>{plainMessagePreview(preview.text)}</CaptionText>;
}

const CaptionText = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
`;

const CaptionSkeleton = styled.span`
  display: block;
  width: 72%;
  max-width: 180px;
  height: 12px;
  margin-top: 2px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--states-background-card-hover) 0%,
    var(--divider-primary) 50%,
    var(--states-background-card-hover) 100%
  );
  background-size: 200% 100%;
  animation: caption-shimmer 1.2s ease-in-out infinite;

  @keyframes caption-shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;
