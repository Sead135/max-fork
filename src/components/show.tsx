import type { ReactNode } from 'react';

type ShowProps = {
  when: boolean;
  children: ReactNode;
  fallback?: ReactNode | null;
};

export function Show({ children, when, fallback = null }: ShowProps) {
  if (when) {
    return children;
  }

  return fallback;
}
