/**
 * Retry utility for scraping operations
 * Implements exponential backoff strategy
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  onRetry: () => {}, // No-op
};

/**
 * Execute async function with exponential backoff retry
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.maxAttempts) {
        const delayMs = Math.min(
          config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelayMs
        );

        console.log(
          `[Retry] Attempt ${attempt}/${config.maxAttempts} failed. Retrying in ${delayMs}ms...`,
          lastError.message
        );

        if (config.onRetry) {
          config.onRetry(attempt, lastError);
        }

        await delay(delayMs);
      }
    }
  }

  throw new Error(
    `操作が${config.maxAttempts}回の再試行後も失敗しました: ${lastError?.message}`
  );
}

/**
 * Utility to delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Network errors are retryable
    if (
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("econnreset") ||
      message.includes("network") ||
      message.includes("temporarily")
    ) {
      return true;
    }
  }
  return false;
}
