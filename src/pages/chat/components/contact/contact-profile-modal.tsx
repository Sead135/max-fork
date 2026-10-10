import styled from 'styled-components';
import type { ChatMeta } from '../../../../api';
import { Panel, ModalShell } from '../../../../ui';
import { ContactProfileBody } from './contact-profile-body';

type ContactProfileModalProps = {
  chatId: string;
  fallbackTitle: string;
  chatType?: string;
  meta?: ChatMeta;
  onClose: () => void;
};

export function ContactProfileModal({
  chatId,
  fallbackTitle,
  chatType,
  meta,
  onClose
}: ContactProfileModalProps) {
  return (
    <ModalShell
      onClose={onClose}
      zIndex={30}
      maxHeight="min(820px, calc(100dvh - 24px))"
    >
      <Panel onClose={onClose}>
        <Body>
          <ContactProfileBody
            chatId={chatId}
            fallbackTitle={fallbackTitle}
            chatType={chatType}
            meta={meta}
          />
        </Body>
      </Panel>
    </ModalShell>
  );
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 4px 16px;
  text-align: left;
`;
