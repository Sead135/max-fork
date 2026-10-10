import type { AvatarTextGradient } from '@maxhub/max-ui';

export function phoneToChatId(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits ? `${digits}@c.us` : '';
}

export function unreadLabel(count: number) {
  if (count <= 0) {
    return null;
  }
  return count > 99 ? '99+' : String(count);
}

export function isRecentlyOnline(lastSeen?: number | null) {
  if (!lastSeen) {
    return false;
  }
  return Date.now() / 1000 - lastSeen < 5 * 60;
}

const GRADIENTS: AvatarTextGradient[] = [
  'red',
  'orange',
  'green',
  'blue',
  'purple'
];

export function avatarGradient(id: string): AvatarTextGradient {
  const value = String(id ?? '');
  let hash = 0;
  for (const char of value) {
    hash = (hash + char.charCodeAt(0)) % GRADIENTS.length;
  }
  return GRADIENTS[hash] ?? 'blue';
}

export function avatarLetters(title: string) {
  const parts = String(title ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const [firstWord, secondWord] = parts;
  if (firstWord && secondWord) {
    return (firstWord.charAt(0) + secondWord.charAt(0)).toUpperCase();
  }
  const digits = title.replace(/\D/g, '');
  return (digits.slice(-2) || title.slice(0, 2) || '?').toUpperCase();
}
