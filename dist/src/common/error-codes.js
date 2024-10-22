"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.AppError = exports.ErrorMessages = exports.ErrorCodes = void 0;
exports.ErrorCodes = {
    INVALID_INPUT: 'E001',
    UNAUTHORIZED: 'E002',
    FORBIDDEN: 'E003',
    NOT_FOUND: 'E004',
    INTERNAL_SERVER_ERROR: 'E500',
};
exports.ErrorMessages = {
    [exports.ErrorCodes.INVALID_INPUT]: 'Invalid input provided',
    [exports.ErrorCodes.UNAUTHORIZED]: 'Unauthorized access',
    [exports.ErrorCodes.FORBIDDEN]: 'Access forbidden',
    [exports.ErrorCodes.NOT_FOUND]: 'Resource not found',
    [exports.ErrorCodes.INTERNAL_SERVER_ERROR]: 'Internal server error',
};
class AppError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function createError(code, additionalInfo) {
    const baseMessage = exports.ErrorMessages[code] || 'An error occurred';
    const fullMessage = additionalInfo ? `${baseMessage}: ${additionalInfo}` : baseMessage;
    return new AppError(code, fullMessage);
}
exports.createError = createError;
//# sourceMappingURL=error-codes.js.map