import type { FormEvent } from 'react';
import styled from 'styled-components';
import { Button, Input } from '@maxhub/max-ui';
import { Show } from '../../../components';
import { Panel, ModalShell } from '../../../ui';

type Props = {
  phone: string;
  error: string;
  onPhoneChange: (phone: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
};

export function AddChatModal({
  phone,
  error,
  onPhoneChange,
  onClose,
  onSubmit
}: Props) {
  return (
    <ModalShell onClose={onClose}>
      <Panel title="Новый чат" onClose={onClose}>
        <Form onSubmit={onSubmit}>
          <Input
            value={phone}
            placeholder="79001234567"
            inputMode="tel"
            autoFocus
            onChange={(event) => onPhoneChange(event.target.value)}
          />

          <Show when={!!error}>
            <ErrorText role="alert">{error}</ErrorText>
          </Show>

          <Button type="submit">Добавить</Button>
        </Form>
      </Panel>
    </ModalShell>
  );
}

const Form = styled.form`
  display: grid;
  gap: 12px;
  padding: 12px;

  & > button {
    width: 100%;
  }
`;

const ErrorText = styled.div`
  color: var(--text-negative);
  text-align: left;
`;
