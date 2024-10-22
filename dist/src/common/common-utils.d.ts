export declare class CommonUtils {
    static generateUUID(): string;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static isValidEmail(email: string): boolean;
    static isStrongPassword(password: string): boolean;
    static formatDate(date: Date): string;
    static sleep(ms: number): Promise<void>;
    static retryOperation<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
    static handleError(error: any): never;
    static validateInput(input: any, schema: any): boolean;
    static sanitizeInput(input: string): string;
    static parseJSON(json: string): any;
    static generateRandomString(length: number): string;
}
