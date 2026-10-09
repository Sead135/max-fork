import type { ReactNode } from 'react';

type Props = {
  when: boolean;
  children: ReactNode;
  fallback?: ReactNode | null;
};

export function Show({ children, when, fallback = null }: Props) {
  if (when) {
    return children;
  }

  return fallback;
}
