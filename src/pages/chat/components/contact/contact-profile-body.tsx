import styled from 'styled-components';
import { Spinner, Typography } from '@maxhub/max-ui';
import type { ChatMeta } from '../../../../api';
import { useSession } from '../../../../session';
import { useChatMeta } from '../../hooks';
import { ContactProfileDetails } from './contact-profile-details';

export type ContactProfileBodyProps = {
  chatId: string;
  fallbackTitle: string;
  chatType?: string;
  meta?: ChatMeta;
};

export function ContactProfileBody({
  chatId,
  fallbackTitle,
  chatType,
  meta: metaProp
}: ContactProfileBodyProps) {
  const { state: session } = useSession();
  const credentials =
    session.status === 'connected' ? session.credentials : null;

  const fallback = useChatMeta(
    metaProp ? null : credentials,
    metaProp ? null : chatId,
    chatType
  );
  const meta = metaProp ?? fallback.data ?? undefined;

  if (!metaProp && fallback.isLoading) {
    return (
      <State>
        <Spinner size={32} />
      </State>
    );
  }

  if (!metaProp && fallback.isError) {
    return (
      <State>
        <Typography.Body variant="medium">
          Не удалось загрузить профиль
        </Typography.Body>
      </State>
    );
  }

  return (
    <ContactProfileDetails
      chatId={chatId}
      fallbackTitle={fallbackTitle}
      meta={meta}
    />
  );
}

const State = styled.div`
  display: grid;
  place-items: center;
  min-height: 180px;
  color: var(--text-secondary);
  text-align: center;
`;
