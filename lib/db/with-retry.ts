const RETRYABLE_CODES = new Set(["ETIMEDOUT", "P1001", "P1002", "P1008"]);

/** Retry transient DB connection errors (e.g. Neon compute waking up). */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const code = (error as { code?: string }).code;
      if (!code || !RETRYABLE_CODES.has(code) || attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw lastError;
}
