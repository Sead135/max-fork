import { useState, type FormEvent, type ChangeEvent } from 'react';
import styled from 'styled-components';
import { Button, Input, Spinner } from '@maxhub/max-ui';
import type { Credentials } from '../api';
import { Show } from '../components';
import { useSession } from '../session';
import { Panel } from '../ui';

export function ConnectPage() {
  const [credentials, setCredentials] = useState<Credentials>({
    idInstance: '',
    apiTokenInstance: ''
  });

  const { state, connect } = useSession();
  const isBusy =
    state.status === 'connecting' ||
    state.status === 'bootstrapping' ||
    state.status === 'connected';

  const onChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: keyof Credentials
  ) => {
    const { value } = e.target;
    setCredentials((prev) => ({ ...prev, [id]: value }));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void connect(credentials);
  };

  return (
    <Panel title="Введите данные интеграции">
      <Wrap>
        <Show when={isBusy}>
          <Busy>
            <Spinner size={32} />
          </Busy>
        </Show>

        <Show when={!isBusy}>
          <Form onSubmit={onSubmit}>
            <Fields>
              <Input
                value={credentials.idInstance}
                placeholder="idInstance"
                onChange={(e) => onChange(e, 'idInstance')}
              />

              <Input
                value={credentials.apiTokenInstance}
                placeholder="apiTokenInstance"
                onChange={(e) => onChange(e, 'apiTokenInstance')}
              />

              <Show when={state.status === 'error'}>
                <Error role="alert">
                  {state.status === 'error' ? state.message : ''}
                </Error>
              </Show>
            </Fields>

            <Actions>
              <Button type="submit">Подключиться</Button>
            </Actions>
          </Form>
        </Show>
      </Wrap>
    </Panel>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  height: 100%;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
`;

const Fields = styled.div`
  display: grid;
  gap: 12px;
`;

const Actions = styled.div`
  margin-top: 16px;
  width: 100%;

  & > button {
    width: 100%;
  }

  @media (max-width: 768px) {
    margin-top: auto;
  }
`;

const Error = styled.div`
  color: var(--text-negative);
`;

const Busy = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 64px 32px;
`;
