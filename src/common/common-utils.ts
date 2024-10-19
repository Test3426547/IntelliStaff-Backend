import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CommonUtils {
  static generateUUID(): string {
    return uuidv4();
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return strongPasswordRegex.test(password);
  }

  static formatDate(date: Date): string {
    return date.toISOString();
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> {
    return new Promise((resolve, reject) => {
      const attempt = async (currentAttempt: number) => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          if (currentAttempt < maxRetries) {
            await this.sleep(delay);
            attempt(currentAttempt + 1);
          } else {
            reject(error);
          }
        }
      };
      attempt(1);
    });
  }

  static handleError(error: any): never {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static validateInput(input: any, schema: any): boolean {
    // Implement input validation logic here
    // This is a placeholder and should be replaced with actual validation logic
    return true;
  }

  static sanitizeInput(input: string): string {
    // Implement input sanitization logic here
    // This is a placeholder and should be replaced with actual sanitization logic
    return input.trim();
  }

  static parseJSON(json: string): any {
    try {
      return JSON.parse(json);
    } catch (error) {
      throw new HttpException('Invalid JSON', HttpStatus.BAD_REQUEST);
    }
  }

  static generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}
