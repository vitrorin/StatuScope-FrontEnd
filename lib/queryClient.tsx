import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createAppQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
