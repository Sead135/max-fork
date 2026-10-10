import { StrictMode } from 'react';
import { MaxUI } from '@maxhub/max-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { queryClient } from './query-client';
import { SessionProvider } from './session';

import '@maxhub/max-ui/dist/styles.css';
import './index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MaxUI>
          <SessionProvider>
            <App />
          </SessionProvider>
        </MaxUI>
      </QueryClientProvider>
    </StrictMode>
  );
}
