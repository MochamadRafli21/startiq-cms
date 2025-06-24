import type { RateLimitInfo } from "@/types/rate-limiter.type";
import { WINDOW_MS, RATE_LIMIT } from "@/constant/rate-limit";

const rateLimitMap = new Map<string, RateLimitInfo>();

export function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (entry) {
    if (now - entry.lastRequestTime < WINDOW_MS) {
      entry.count += 1;
      if (entry.count > RATE_LIMIT) {
        const retryAfter = Math.ceil(
          (WINDOW_MS - (now - entry.lastRequestTime)) / 1000,
        );
        return { success: false, retryAfter };
      }
      rateLimitMap.set(ip, entry);
    } else {
      // Reset after time window
      rateLimitMap.set(ip, { count: 1, lastRequestTime: now });
    }
  } else {
    rateLimitMap.set(ip, { count: 1, lastRequestTime: now });
  }

  return { success: true, retryAfter: 0 };
}
