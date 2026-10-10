import styled from 'styled-components';
import { Typography } from '@maxhub/max-ui';
import { Background } from '../../../ui';

export function ChatPaneEmpty() {
  return (
    <Pane>
      <Background>
        <Empty>
          <Hint>Добавьте или выберите чат</Hint>
        </Empty>
      </Background>
    </Pane>
  );
}

const Pane = styled.section`
  min-width: 0;
  height: 100%;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Empty = styled.div`
  padding: 24px;
  text-align: center;
`;

const Hint = styled(Typography.Title)`
  display: inline-block;
  padding: 10px 16px;
  border-radius: 16px;
  background: var(--bubbles-system-step-2);
  color: var(--text-primary);
`;
