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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var UserManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const speakeasy = __importStar(require("speakeasy"));
const qrcode = __importStar(require("qrcode"));
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const terminus_1 = require("@nestjs/terminus");
const node_cache_1 = __importDefault(require("node-cache"));
const common_utils_1 = require("../common/common-utils");
let UserManagementService = UserManagementService_1 = class UserManagementService extends terminus_1.HealthIndicator {
    constructor(configService, jwtService) {
        super();
        this.configService = configService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(UserManagementService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.userCache = new node_cache_1.default({ stdTTL: 600, checkperiod: 120 });
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('users').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('user_management_db', true, { message: 'User Management DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('User Management DB check failed', error);
        }
    }
    async retryOperation(operation, maxRetries = 3) {
        return common_utils_1.CommonUtils.retryOperation(operation, maxRetries);
    }
    async register(email, password, role = 'user') {
        if (!common_utils_1.CommonUtils.isValidEmail(email)) {
            throw new common_1.BadRequestException('Invalid email format');
        }
        if (!common_utils_1.CommonUtils.isStrongPassword(password)) {
            throw new common_1.BadRequestException('Password does not meet strength requirements');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password: hashedPassword,
            });
            if (error)
                throw new common_1.BadRequestException(`Registration failed: ${error.message}`);
            await this.supabase.from('user_roles').insert({ user_id: data.user.id, role });
            return { user: data.user, message: 'Registration successful. Please check your email to confirm your account.' };
        });
    }
    async login(email, password, twoFactorToken) {
        return this.retryOperation(async () => {
            const { data: user, error: userError } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            if (userError || !user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            if (user.is_locked && new Date(user.locked_until) > new Date()) {
                throw new common_1.UnauthorizedException('Account is locked. Please try again later.');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                await this.incrementLoginAttempts(user.id);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            if (user.two_factor_enabled) {
                if (!twoFactorToken) {
                    throw new common_1.UnauthorizedException('Two-factor authentication token required');
                }
                const isValid = this.verify2FAToken(user.two_factor_secret, twoFactorToken);
                if (!isValid) {
                    throw new common_1.UnauthorizedException('Invalid two-factor authentication token');
                }
            }
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error)
                throw new common_1.UnauthorizedException(`Login failed: ${error.message}`);
            await this.resetLoginAttempts(user.id);
            const role = await this.getUserRole(data.user.id);
            const refreshToken = common_utils_1.CommonUtils.generateRandomString(40);
            await this.storeRefreshToken(data.user.id, refreshToken);
            return Object.assign(Object.assign({}, data), { role, refreshToken });
        });
    }
    async logout(token) {
        return this.retryOperation(async () => {
            const { error } = await this.supabase.auth.signOut();
            if (error)
                throw new common_1.UnauthorizedException(`Logout failed: ${error.message}`);
            await this.revokeToken(token);
        });
    }
    async getUser(token) {
        return this.retryOperation(async () => {
            const cachedUser = this.userCache.get(token);
            if (cachedUser) {
                return cachedUser;
            }
            const { data: { user }, error } = await this.supabase.auth.getUser(token);
            if (error)
                throw new common_1.UnauthorizedException(`Failed to get user: ${error.message}`);
            const role = await this.getUserRole(user.id);
            const userData = Object.assign(Object.assign({}, user), { role });
            this.userCache.set(token, userData);
            return userData;
        });
    }
    async refreshToken(refreshToken) {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase.auth.refreshSession({ refresh_token: refreshToken });
            if (error)
                throw new common_1.UnauthorizedException(`Token refresh failed: ${error.message}`);
            const newRefreshToken = common_utils_1.CommonUtils.generateRandomString(40);
            await this.rotateRefreshToken(data.user.id, refreshToken, newRefreshToken);
            return Object.assign(Object.assign({}, data), { refreshToken: newRefreshToken });
        });
    }
    async enable2FA(userId) {
        return this.retryOperation(async () => {
            const secret = speakeasy.generateSecret({ length: 32 });
            const otpauthUrl = speakeasy.otpauthURL({
                secret: secret.base32,
                label: this.configService.get('APP_NAME'),
                issuer: this.configService.get('APP_NAME'),
            });
            const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
            await this.supabase
                .from('users')
                .update({ two_factor_secret: secret.base32, two_factor_enabled: true })
                .eq('id', userId);
            return { secret: secret.base32, qrCodeUrl };
        });
    }
    verify2FAToken(secret, token) {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
        });
    }
    async incrementLoginAttempts(userId) {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('users')
                .select('login_attempts')
                .eq('id', userId)
                .single();
            if (error)
                throw new Error(`Failed to get login attempts: ${error.message}`);
            const newAttempts = (data.login_attempts || 0) + 1;
            await this.supabase
                .from('users')
                .update({ login_attempts: newAttempts })
                .eq('id', userId);
            if (newAttempts >= 5) {
                await this.lockAccount(userId);
            }
        });
    }
    async resetLoginAttempts(userId) {
        return this.retryOperation(async () => {
            await this.supabase
                .from('users')
                .update({ login_attempts: 0 })
                .eq('id', userId);
        });
    }
    async lockAccount(userId) {
        return this.retryOperation(async () => {
            await this.supabase
                .from('users')
                .update({ is_locked: true, locked_until: new Date(Date.now() + 30 * 60 * 1000) })
                .eq('id', userId);
        });
    }
    async getUserRole(userId) {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .single();
            if (error)
                throw new Error(`Failed to get user role: ${error.message}`);
            return data.role;
        });
    }
    async revokeToken(token) {
        return this.retryOperation(async () => {
            await this.supabase
                .from('revoked_tokens')
                .insert({ token, revoked_at: new Date().toISOString() });
        });
    }
    async storeRefreshToken(userId, refreshToken) {
        return this.retryOperation(async () => {
            await this.supabase
                .from('refresh_tokens')
                .insert({ user_id: userId, token: refreshToken, created_at: new Date().toISOString() });
        });
    }
    async rotateRefreshToken(userId, oldToken, newToken) {
        return this.retryOperation(async () => {
            await this.supabase
                .from('refresh_tokens')
                .update({ token: newToken, created_at: new Date().toISOString() })
                .match({ user_id: userId, token: oldToken });
        });
    }
    async hasPermission(userId, permission) {
        const { data, error } = await this.supabase
            .from('user_roles')
            .select('roles(permissions)')
            .eq('user_id', userId);
        if (error) {
            this.logger.error(`Error checking permission: ${error.message}`);
            return false;
        }
        if (!data || data.length === 0) {
            return false;
        }
        return data.some(role => role.roles && Array.isArray(role.roles.permissions) && role.roles.permissions.includes(permission));
    }
    startCacheCleanup() {
        setInterval(() => {
            this.logger.log('Starting cache cleanup');
            this.userCache.flushAll();
            this.logger.log('Cache cleanup completed');
        }, 600000);
    }
};
exports.UserManagementService = UserManagementService;
exports.UserManagementService = UserManagementService = UserManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService])
], UserManagementService);
//# sourceMappingURL=user-management.service.js.map