"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonUtils = void 0;
const uuid_1 = require("uuid");
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
class CommonUtils {
    static generateUUID() {
        return (0, uuid_1.v4)();
    }
    static async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
    static async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isStrongPassword(password) {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
        return strongPasswordRegex.test(password);
    }
    static formatDate(date) {
        return date.toISOString();
    }
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static retryOperation(operation, maxRetries = 3, delay = 1000) {
        return new Promise((resolve, reject) => {
            const attempt = async (currentAttempt) => {
                try {
                    const result = await operation();
                    resolve(result);
                }
                catch (error) {
                    if (currentAttempt < maxRetries) {
                        await this.sleep(delay);
                        attempt(currentAttempt + 1);
                    }
                    else {
                        reject(error);
                    }
                }
            };
            attempt(1);
        });
    }
    static handleError(error) {
        if (error instanceof common_1.HttpException) {
            throw error;
        }
        throw new common_1.HttpException('Internal Server Error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    static validateInput(input, schema) {
        return true;
    }
    static sanitizeInput(input) {
        return input.trim();
    }
    static parseJSON(json) {
        try {
            return JSON.parse(json);
        }
        catch (error) {
            throw new common_1.HttpException('Invalid JSON', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    static generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}
exports.CommonUtils = CommonUtils;
//# sourceMappingURL=common-utils.js.map