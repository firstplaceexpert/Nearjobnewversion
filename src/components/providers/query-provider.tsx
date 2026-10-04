/**
 * TanStack Query Provider — Client-side data fetching & caching
 *
 * Wraps the app in a QueryClientProvider with sensible defaults:
 * - Stale time: 60 seconds (reduce unnecessary refetches)
 * - Retry: 1 attempt (fail fast, don't hammer the server)
 * - Refetch on window focus: enabled (keep data fresh)
 */
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
