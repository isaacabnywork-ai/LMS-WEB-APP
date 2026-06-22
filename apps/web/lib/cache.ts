// Mock Redis Cache Utility for Local Development
// In production, this would use `@upstash/redis`

const cacheStore = new Map<string, { value: any; expiresAt: number }>();

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const entry = cacheStore.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      cacheStore.delete(key);
      return null;
    }

    console.log(`[CACHE HIT] ${key}`);
    return entry.value as T;
  },

  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    cacheStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    console.log(`[CACHE SET] ${key} (ttl: ${ttlSeconds}s)`);
  },

  async delete(key: string): Promise<void> {
    cacheStore.delete(key);
    console.log(`[CACHE DEL] ${key}`);
  },
};
