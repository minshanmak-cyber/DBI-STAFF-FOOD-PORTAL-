interface RateLimitEntry {
  attempts: number;
  lockoutUntil: number | null;
  firstAttemptAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes lockout

export function checkLoginRateLimit(identifier: string): {
  isBlocked: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    return { isBlocked: false };
  }

  // Check if locked out
  if (entry.lockoutUntil && now < entry.lockoutUntil) {
    const retryAfterSeconds = Math.ceil((entry.lockoutUntil - now) / 1000);
    return { isBlocked: true, retryAfterSeconds };
  }

  // If lockout has expired, reset
  if (entry.lockoutUntil && now >= entry.lockoutUntil) {
    rateLimitStore.delete(identifier);
    return { isBlocked: false };
  }

  // If window expired, reset
  if (now - entry.firstAttemptAt > WINDOW_MS) {
    rateLimitStore.delete(identifier);
    return { isBlocked: false };
  }

  return { isBlocked: false };
}

export function recordFailedLoginAttempt(identifier: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      lockoutUntil: null,
      firstAttemptAt: now,
    });
    return { isBlocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - 1 };
  }

  entry.attempts += 1;

  if (entry.attempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockoutUntil = now + LOCKOUT_MS;
    const retryAfterSeconds = Math.ceil(LOCKOUT_MS / 1000);
    return { isBlocked: true, remainingAttempts: 0, retryAfterSeconds };
  }

  return {
    isBlocked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - entry.attempts,
  };
}

export function resetLoginRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

