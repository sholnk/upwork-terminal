/**
 * Structured Logging System
 * Logs errors, performance metrics, and user activities
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    };

    // Console output in development
    if (this.isDevelopment) {
      const color = {
        [LogLevel.DEBUG]: '\x1b[36m',
        [LogLevel.INFO]: '\x1b[32m',
        [LogLevel.WARN]: '\x1b[33m',
        [LogLevel.ERROR]: '\x1b[31m',
      }[level];

      console.log(
        `${color}[${entry.timestamp}] ${level}: ${message}\x1b[0m`,
        context ? context : ''
      );
    }

    // Send to monitoring service in production
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      this.sendToMonitoring(entry);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    console.error(entry);
    this.sendToMonitoring(entry);
  }

  private sendToMonitoring(entry: LogEntry) {
    // Send to Sentry or similar service
    if (process.env.SENTRY_DSN) {
      fetch(process.env.SENTRY_DSN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch((err) => {
        console.error('Failed to send log to monitoring:', err);
      });
    }
  }
}

export const logger = new Logger();

/**
 * Performance monitoring decorator
 */
export function measurePerformance(target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const start = performance.now();
    try {
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;

      if (duration > 1000) {
        logger.warn(`Slow operation detected: ${propertyKey} took ${duration}ms`, {
          method: propertyKey,
          duration,
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`Operation failed: ${propertyKey}`, error as Error, {
        method: propertyKey,
        duration,
      });
      throw error;
    }
  };

  return descriptor;
}
