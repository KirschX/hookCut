/**
 * KV wrapper. MVP: noop unless KV_REST_API_URL is set.
 * v1.1: switch to @upstash/redis (Vercel KV is now Upstash-backed).
 */

interface KvLike {
  get<T = unknown>(key: string): Promise<T | null>;
  set(
    key: string,
    value: unknown,
    opts?: { ex?: number },
  ): Promise<unknown>;
  del(key: string): Promise<unknown>;
}

class NoopKv implements KvLike {
  async get(): Promise<null> {
    return null;
  }
  async set(): Promise<null> {
    return null;
  }
  async del(): Promise<null> {
    return null;
  }
}

export const kvAvailable =
  Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN);

let cached: KvLike | null = null;

export function getKv(): KvLike {
  if (cached) return cached;
  if (!kvAvailable) {
    cached = new NoopKv();
    return cached;
  }
  // Lazy-load Upstash REST client when KV is configured.
  // We avoid hard-importing to keep edge bundle small in mock mode.
  cached = new NoopKv(); // placeholder; v1.1 wires @upstash/redis here.
  return cached;
}
