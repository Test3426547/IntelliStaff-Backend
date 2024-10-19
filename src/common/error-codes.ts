export const ErrorCodes = {
  INVALID_INPUT: 'E001',
  UNAUTHORIZED: 'E002',
  FORBIDDEN: 'E003',
  NOT_FOUND: 'E004',
  INTERNAL_SERVER_ERROR: 'E500',
};

export const ErrorMessages = {
  [ErrorCodes.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCodes.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCodes.FORBIDDEN]: 'Access forbidden',
  [ErrorCodes.NOT_FOUND]: 'Resource not found',
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'Internal server error',
};

export class AppError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function createError(code: string, additionalInfo?: string): AppError {
  const baseMessage = ErrorMessages[code] || 'An error occurred';
  const fullMessage = additionalInfo ? `${baseMessage}: ${additionalInfo}` : baseMessage;
  return new AppError(code, fullMessage);
}
