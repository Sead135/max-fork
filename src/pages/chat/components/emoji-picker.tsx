import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@maxhub/max-ui';
import { Show } from '../../../components';

const EMOJIS = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '😘',
  '😎',
  '🤔',
  '😅',
  '😭',
  '😡',
  '🥺',
  '😴',
  '🤯',
  '🥳',
  '👍',
  '👎',
  '👏',
  '🙏',
  '🔥',
  '❤️',
  '💔',
  '✨',
  '🎉',
  '💯',
  '✅',
  '❌',
  '⭐',
  '🌟',
  '💬',
  '👋',
  '🤝',
  '💪',
  '👀',
  '🙈',
  '🐶',
  '🐱',
  '🍕',
  '☕',
  '🎂',
  '🚀',
  '☀️',
  '🌙',
  '⚽',
  '🎮',
  '📱',
  '💡'
];

type Props = {
  disabled?: boolean;
  onPick: (emoji: string) => void;
};

export function EmojiPickerButton({ disabled, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <Root ref={rootRef}>
      <Trigger
        type="button"
        variant="ghost"
        size="medium"
        aria-label="Эмодзи"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
      >
        <EmojiIcon />
      </Trigger>

      <Show when={open}>
        <Panel role="listbox" aria-label="Выбор эмодзи">
          {EMOJIS.map((emoji) => (
            <Emoji key={emoji} type="button" onClick={() => onPick(emoji)}>
              {emoji}
            </Emoji>
          ))}
        </Panel>
      </Show>
    </Root>
  );
}

function EmojiIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <path
        d="M8.5 14.5c1.2 1.4 2.6 2 3.5 2s2.3-.6 3.5-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const Root = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Trigger = styled(IconButton)`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  color: var(--icon-secondary);
`;

const Panel = styled.div`
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  width: 280px;
  max-width: min(280px, calc(100vw - 24px));
  padding: 8px;
  border-radius: 16px;
  border: 1px solid var(--divider-primary);
  background: var(--background-primary);
  box-shadow: 0 8px 24px var(--shadow-elevation-3-primary);
`;

const Emoji = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  border-radius: 10px;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: var(--states-background-card-hover);
  }
`;
