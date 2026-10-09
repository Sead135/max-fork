import {
  CellHeader,
  CellList,
  CellSimple,
  Spinner,
  Typography
} from '@maxhub/max-ui';
import styled from 'styled-components';
import type { ChatMeta, Credentials } from '../../../api/green-api';
import { Show } from '../../../components';
import { Modal, ModalShell } from '../../../ui';
import { ChatAvatar } from './chat-avatar';
import { isRecentlyOnline, useChatMeta } from '../hooks/use-chat-meta';

type Props = {
  chatId: string;
  fallbackTitle: string;
  chatType?: string;
  meta?: ChatMeta;
  credentials: Credentials;
  onClose: () => void;
};

const CHAT_TYPE_LABEL: Record<string, string> = {
  user: 'Пользователь',
  group: 'Группа',
  channel: 'Канал',
  bot: 'Бот'
};

export function ContactProfileModal({
  chatId,
  fallbackTitle,
  chatType,
  meta: metaProp,
  credentials,
  onClose
}: Props) {
  const fallback = useChatMeta(
    credentials,
    metaProp ? null : chatId,
    chatType
  );
  const meta = metaProp ?? fallback.data;
  const isLoading = !metaProp && fallback.isLoading;
  const error = metaProp ? null : fallback.error;

  const title = meta?.title || fallbackTitle;
  let typeLabel: string | null = null;
  if (meta?.chatType) {
    typeLabel = CHAT_TYPE_LABEL[meta.chatType] ?? meta.chatType;
  }
  const phone =
    meta?.phoneNumber && meta.phoneNumber > 0
      ? formatPhone(meta.phoneNumber)
      : null;
  const about =
    meta?.description?.trim() ||
    (meta?.kind === 'contact' ? meta.name || meta.contactName : null);

  return (
    <ModalShell
      onClose={onClose}
      zIndex={30}
      maxHeight="min(820px, calc(100dvh - 24px))"
    >
      <Modal onClose={onClose}>
        <Body>
          <Show when={isLoading}>
            <State>
              <Spinner size={32} />
            </State>
          </Show>

          <Show when={!isLoading && Boolean(error)}>
            <State>
              <Typography.Body variant="medium">
                {error instanceof Error
                  ? error.message
                  : 'Не удалось загрузить профиль'}
              </Typography.Body>
            </State>
          </Show>

          <Show when={!isLoading && !error}>
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
                <Show when={Boolean(about)}>
                  <CellList
                    mode="island"
                    header={<CellHeader>О себе</CellHeader>}
                  >
                    <CellSimple height="compact" title={about ?? ''} />
                  </CellList>
                </Show>

                <Show when={Boolean(phone)}>
                  <CellList
                    mode="island"
                    header={<CellHeader>Телефон</CellHeader>}
                  >
                    <PhoneCell
                      height="compact"
                      title={
                        <PhoneLink href={`tel:+${meta?.phoneNumber ?? ''}`}>
                          {phone}
                        </PhoneLink>
                      }
                    />
                  </CellList>
                </Show>

                <Show when={Boolean(meta?.inviteLink)}>
                  <CellList
                    mode="island"
                    header={<CellHeader>Ссылка</CellHeader>}
                  >
                    <CellSimple
                      height="compact"
                      title={
                        <PhoneLink
                          href={meta?.inviteLink ?? ''}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {meta?.inviteLink}
                        </PhoneLink>
                      }
                    />
                  </CellList>
                </Show>

                <CellList
                  mode="island"
                  header={<CellHeader>Идентификатор</CellHeader>}
                >
                  <CellSimple height="compact" title={chatId} />
                </CellList>
              </Sections>
            </>
          </Show>
        </Body>
      </Modal>
    </ModalShell>
  );
}

function formatPhone(phone: number) {
  const digits = String(phone);
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  return `+${digits}`;
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 4px 16px;
  text-align: left;
`;

const State = styled.div`
  display: grid;
  place-items: center;
  min-height: 180px;
  color: var(--text-secondary);
  text-align: center;
`;

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

const PhoneLink = styled.a`
  color: var(--text-themed);
  text-decoration: none;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }
`;
