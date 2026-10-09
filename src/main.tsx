import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { MaxUI } from '@maxhub/max-ui';
import { App } from './App';
import { queryClient } from './query-client';
import { SessionProvider } from './session';

import '@maxhub/max-ui/dist/styles.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
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
