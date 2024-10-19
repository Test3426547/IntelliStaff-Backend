import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserManagementService } from './user-management.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userManagementService: UserManagementService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }
    try {
      const user = await this.userManagementService.getUser(token);
      
      // Check if 2FA is enabled and verified
      if (user.two_factor_enabled) {
        const twoFactorToken = request.headers['x-2fa-token'];
        if (!twoFactorToken) {
          throw new UnauthorizedException('2FA token is required');
        }
        const isValid = await this.userManagementService.verify2FA(user.id, twoFactorToken);
        if (!isValid) {
          throw new UnauthorizedException('Invalid 2FA token');
        }
      }

      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication token');
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
