import { useEffect, useRef, useState, type UIEvent } from 'react';
import styled from 'styled-components';
import { Icon16Chevron, IconButton, Spinner, Typography } from '@maxhub/max-ui';
import type { ChatMessage } from '../lib';
import { BubbleMedia } from './bubble-media';
import { MessageText } from './message-text';

const NEAR_BOTTOM_PX = 80;

type Props = {
  chatId: string;
  messages: ChatMessage[];
  loading?: boolean;
  historyError?: string;
};

export function MessageScroller(props: Props) {
  return <MessageScrollerView key={props.chatId} {...props} />;
}

function MessageScrollerView({
  chatId,
  messages,
  loading,
  historyError
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const [showJump, setShowJump] = useState(false);

  const updateJump = (el: HTMLDivElement) => {
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = dist <= NEAR_BOTTOM_PX;
    stickToBottom.current = nearBottom;
    setShowJump(!nearBottom);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = listRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior });
    stickToBottom.current = true;
    setShowJump(false);
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el || loading || !stickToBottom.current) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [loading, messages]);

  if (loading) {
    return (
      <MessagesWrap>
        <FloatStatus>
          <Spinner appearance="primary" size={20} />
        </FloatStatus>
      </MessagesWrap>
    );
  }

  if (historyError) {
    return (
      <MessagesWrap>
        <FloatStatus>
          <Typography.Body variant="medium">{historyError}</Typography.Body>
        </FloatStatus>
      </MessagesWrap>
    );
  }

  return (
    <MessagesWrap>
      <Messages
        ref={listRef}
        onScroll={(e: UIEvent<HTMLDivElement>) => updateJump(e.currentTarget)}
      >
        {messages.map((message) => (
          <Bubble
            key={`${chatId}:${message.id}`}
            $fromMe={message.fromMe}
            $wide={!!message.imageUrl}
          >
            {message.imageUrl ? (
              <BubbleMedia key={message.imageUrl} src={message.imageUrl} />
            ) : null}
            {message.text ? (
              <BubbleText>
                <MessageText text={message.text} />
              </BubbleText>
            ) : null}
            <Time $fromMe={message.fromMe}>
              {formatMessageTime(message.at)}
            </Time>
          </Bubble>
        ))}
      </Messages>

      {showJump ? (
        <JumpButton
          type="button"
          variant="primary"
          size="medium"
          aria-label="К последним сообщениям"
          onClick={() => scrollToBottom('smooth')}
        >
          <ChevronDown>
            <Icon16Chevron />
          </ChevronDown>
        </JumpButton>
      ) : null}
    </MessagesWrap>
  );
}

const messageTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit'
});

function formatMessageTime(at: number) {
  return messageTimeFormatter.format(new Date(at));
}

const MessagesWrap = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const Messages = styled.div`
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;

  &::before {
    content: '';
    flex: 1 1 auto;
  }
`;

const JumpButton = styled(IconButton)`
  position: absolute;
  right: 16px;
  bottom: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 4px 16px var(--shadow-elevation-3-primary);
`;

const ChevronDown = styled.span`
  display: inline-flex;
  transform: rotate(90deg);
`;

const FloatStatus = styled.div`
  flex: 1;
  display: grid;
  place-items: center;
  color: var(--text-secondary);
`;

const Bubble = styled.div<{ $fromMe: boolean; $wide?: boolean }>`
  width: ${({ $wide }) => ($wide ? 'min(72%, 320px)' : 'auto')};
  max-width: min(72%, 320px);
  flex-shrink: 0;
  align-self: ${({ $fromMe }) => ($fromMe ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 16px;
  background: ${({ $fromMe }) =>
    $fromMe ? 'var(--button-primary)' : 'var(--bubbles-system-step-2)'};
  color: ${({ $fromMe }) =>
    $fromMe ? 'var(--text-primary-inverse-static)' : 'var(--text-primary)'};
`;

const BubbleText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`;

const Time = styled.time<{ $fromMe: boolean }>`
  align-self: flex-end;
  font-size: 11px;
  line-height: 1;
  opacity: 0.72;
  color: ${({ $fromMe }) =>
    $fromMe ? 'var(--text-primary-inverse-static)' : 'var(--text-secondary)'};
`;
