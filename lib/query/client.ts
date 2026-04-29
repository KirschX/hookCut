import { QueryClient } from "@tanstack/react-query";
import { HookCutApiError } from "@/lib/api/errors";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, gcTime: 5 * 60_000, retry: false },
      mutations: {
        retry: (failureCount, error) => {
          if (!(error instanceof HookCutApiError)) return false;
          if (!error.retryable) return false;
          return failureCount < 2;
        },
        retryDelay: (n) => Math.min(1000 * 2 ** n, 8000),
      },
    },
  });
}
