/**
 * Application-wide error definitions
 * All errors with Japanese messages
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Validation errors (400)
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

// Not found errors (404)
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(
      "NOT_FOUND",
      `${resource}が見つかりません`,
      404
    );
    this.name = "NotFoundError";
  }
}

// Unauthorized errors (401)
export class UnauthorizedError extends AppError {
  constructor(message: string = "認証が必要です") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

// Forbidden errors (403)
export class ForbiddenError extends AppError {
  constructor(message: string = "アクセスが拒否されました") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

// Conflict errors (409)
export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
    this.name = "ConflictError";
  }
}

// Server errors (500)
export class InternalError extends AppError {
  constructor(message: string = "内部サーバーエラーが発生しました", details?: Record<string, unknown>) {
    super("INTERNAL_ERROR", message, 500, details);
    this.name = "InternalError";
  }
}

// API integration errors
export class APIIntegrationError extends AppError {
  constructor(service: string, details?: Record<string, unknown>) {
    super(
      "API_INTEGRATION_ERROR",
      `${service}の統合エラーが発生しました`,
      500,
      details
    );
    this.name = "APIIntegrationError";
  }
}

/**
 * Error formatter for API responses
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    };
  }

  if (error instanceof Error) {
    return {
      error: "UNKNOWN_ERROR",
      message: "予期しないエラーが発生しました",
      details: { originalMessage: error.message },
    };
  }

  return {
    error: "UNKNOWN_ERROR",
    message: "予期しないエラーが発生しました",
  };
}

/**
 * Get appropriate HTTP status code
 */
export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}
