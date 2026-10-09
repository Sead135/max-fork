import { IconButton, Textarea } from '@maxhub/max-ui';
import { useState, type FormEvent, type KeyboardEvent } from 'react';
import styled from 'styled-components';
import { EmojiPickerButton } from './emoji-picker';

type Props = {
  disabled?: boolean;
  onSend: (text: string) => void;
};

export function MessageComposer({ disabled, onSend }: Props) {
  const [text, setText] = useState('');

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const next = text.trim();
    if (!next || disabled) {
      return;
    }
    onSend(next);
    setText('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <ComposerForm onSubmit={submit}>
      <EmojiPickerButton
        disabled={disabled}
        onPick={(emoji) => setText((prev) => `${prev}${emoji}`)}
      />
      <InputWrap>
        <Field
          value={text}
          placeholder="Сообщение"
          rows={1}
          disabled={disabled}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </InputWrap>
      <SendButton
        type="submit"
        variant="primary"
        size="medium"
        aria-label="Отправить"
        disabled={disabled}
      >
        <SendIcon />
      </SendButton>
    </ComposerForm>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12h18M13 6l8 6-8 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ComposerForm = styled.form`
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 12px 12px;
  background: var(--writebar-input-flat);
  overflow: visible;
`;

const InputWrap = styled.div`
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
`;

const Field = styled(Textarea)`
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;

  & textarea {
    display: block;
    width: 100% !important;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    resize: none;
    overflow-x: hidden;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
`;

const SendButton = styled(IconButton)`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  min-width: 40px;
  border-radius: 50%;
`;
