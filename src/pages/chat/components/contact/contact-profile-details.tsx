import styled from 'styled-components';
import { CellHeader, CellList, CellSimple, Typography } from '@maxhub/max-ui';
import type { ChatMeta } from '../../../../api';
import { Show } from '../../../../components';
import { isRecentlyOnline } from '../../lib';
import { ChatAvatar } from '../chat/chat-avatar';
import { InlineLink, MessageText } from '../message/message-text';

export type ContactProfileDetailsProps = {
  chatId: string;
  fallbackTitle: string;
  meta?: ChatMeta;
};

const CHAT_TYPE_LABEL: Record<string, string> = {
  user: 'Пользователь',
  group: 'Группа',
  channel: 'Канал',
  bot: 'Бот'
};

export function ContactProfileDetails({
  chatId,
  fallbackTitle,
  meta
}: ContactProfileDetailsProps) {
  const title = meta?.title || fallbackTitle;
  const typeLabel = formatTypeLabel(meta?.chatType);
  const phone = formatPhone(meta?.phoneNumber);
  const about = formatAbout(meta);

  return (
    <>
      <Hero>
        <ChatAvatar
          chatId={chatId}
          title={title}
          avatarUrl={meta?.avatar}
          size={96}
          online={isRecentlyOnline(meta?.lastSeen)}
        />
        <HeroText>
          <Typography.Headline>{title}</Typography.Headline>
          <Typography.Body variant="small">
            {meta?.subtitle || typeLabel || 'Профиль'}
          </Typography.Body>
        </HeroText>
      </Hero>

      <Sections>
        <Show when={!!about}>
          <CellList mode="island" header={<CellHeader>О себе</CellHeader>}>
            <CellSimple
              height="compact"
              title={
                <AboutText>
                  <MessageText text={about ?? ''} />
                </AboutText>
              }
            />
          </CellList>
        </Show>

        <Show when={!!phone}>
          <CellList mode="island" header={<CellHeader>Телефон</CellHeader>}>
            <PhoneCell
              height="compact"
              title={
                <InlineLink href={`tel:+${meta?.phoneNumber ?? ''}`}>
                  {phone}
                </InlineLink>
              }
            />
          </CellList>
        </Show>

        <Show when={!!meta?.inviteLink}>
          <CellList mode="island" header={<CellHeader>Ссылка</CellHeader>}>
            <CellSimple
              height="compact"
              title={
                <InlineLink
                  href={meta?.inviteLink ?? ''}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {meta?.inviteLink}
                </InlineLink>
              }
            />
          </CellList>
        </Show>

        <CellList mode="island" header={<CellHeader>Идентификатор</CellHeader>}>
          <CellSimple height="compact" title={chatId} />
        </CellList>
      </Sections>
    </>
  );
}

function formatTypeLabel(chatType?: string) {
  if (!chatType) {
    return null;
  }
  return CHAT_TYPE_LABEL[chatType] ?? chatType;
}

function formatAbout(meta?: ChatMeta | null) {
  const description = meta?.description?.trim() || null;
  if (description) {
    return description;
  }
  if (meta?.kind !== 'contact') {
    return null;
  }
  return meta.name || meta.contactName || null;
}

function formatPhone(phone?: number) {
  if (!phone || phone <= 0) {
    return null;
  }

  const digits = String(phone);
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  return `+${digits}`;
}

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding-top: 8px;
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  color: var(--text-secondary);
`;

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const PhoneCell = styled(CellSimple)`
  --text-primary: var(--text-themed);
`;

const AboutText = styled.span`
  white-space: pre-wrap;
  word-break: break-word;
`;
