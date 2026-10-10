import { QueryClient } from '@tanstack/react-query';
import { isQuotaError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (count, error) => {
        if (isQuotaError(error)) {
          return false;
        }
        return count < 2;
      }
    }
  }
});
