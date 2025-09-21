import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { wagmiConfig, chains } from './config/wagmi';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            accentColor: '#8b5cf6',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          showRecentTransactions={true}
        >
          <QueryClientProvider client={queryClient}>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#f8fafc',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f8fafc',
                  },
                },
              }}
            />
          </QueryClientProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </BrowserRouter>
  </React.StrictMode>
);
