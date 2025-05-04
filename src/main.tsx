import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AudioProvider from './components/AudioProvider';
import AppRouter from './router';

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <AudioProvider>
        <AppRouter />
      </AudioProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
