type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Simple in-memory TTL cache for the Node server process. Not shared across
 * multiple server instances/processes — fine for this app's single-instance
 * deployment, and only used for data that's safe to serve slightly stale.
 */
export async function getOrSetCache<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (entry && entry.expiresAt > now) {
    return entry.value;
  }

  const value = await factory();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidateCache(keyPrefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) {
      store.delete(key);
    }
  }
}
