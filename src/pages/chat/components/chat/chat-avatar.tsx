import styled from 'styled-components';
import { Avatar } from '@maxhub/max-ui';
import { Show } from '../../../../components';
import { avatarGradient, avatarLetters } from '../../lib';

type Props = {
  chatId: string;
  title: string;
  avatarUrl?: string;
  size?: number;
  online?: boolean;
};

export function ChatAvatar({
  chatId,
  title,
  avatarUrl,
  size = 48,
  online
}: Props) {
  return (
    <Avatar.Container
      size={size}
      style={{ flex: '0 0 auto' }}
      rightBottomCorner={online ? <OnlineDot /> : undefined}
    >
      <Show when={!!avatarUrl}>
        <Avatar.Image
          src={avatarUrl}
          alt={title}
          fallback={avatarLetters(title)}
          fallbackGradient={avatarGradient(chatId)}
        />
      </Show>

      <Show when={!avatarUrl}>
        <Avatar.Text gradient={avatarGradient(chatId)}>
          {avatarLetters(title)}
        </Avatar.Text>
      </Show>
    </Avatar.Container>
  );
}

const OnlineDot = styled.span`
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--icon-themed);
  border: 2px solid var(--background-primary);
`;
