export declare const ErrorCodes: {
    INVALID_INPUT: string;
    UNAUTHORIZED: string;
    FORBIDDEN: string;
    NOT_FOUND: string;
    INTERNAL_SERVER_ERROR: string;
};
export declare const ErrorMessages: {
    [x: string]: string;
};
export declare class AppError extends Error {
    code: string;
    constructor(code: string, message: string);
}
export declare function createError(code: string, additionalInfo?: string): AppError;
