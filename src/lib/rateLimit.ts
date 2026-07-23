// ponytail: in-memory fixed-window limiter. Single-instance only — resets on
// deploy and does not share state across processes. Swap for Redis/Upstash if
// you scale to multiple instances. Fine for one Node server.
const hits = new Map<string, { count: number; resetAt: number }>();

/** Returns true if allowed, false if the key is over `limit` within `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

// Sweep expired entries occasionally so the Map can't grow unbounded.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
  }, 60_000).unref?.();
}
