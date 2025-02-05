import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserManagementService } from './user-management.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userManagementService: UserManagementService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const user = await this.userManagementService.getUser(token);
      
      // Check if 2FA is required
      if (user.two_factor_enabled) {
        const twoFactorToken = request.headers['x-2fa-token'];
        if (!twoFactorToken) {
          throw new UnauthorizedException('Two-factor authentication token required');
        }
        const isValid = await this.userManagementService.verify2FAToken(user.two_factor_secret, twoFactorToken);
        if (!isValid) {
          throw new UnauthorizedException('Invalid two-factor authentication token');
        }
      }
      
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
