import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard  implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const payload = this.jwtService.verify(token);

    // Sempre adiciona o payload do JWT ao request.user
    request.user = payload;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Se não há roles especificados, permite o acesso
    if (!requiredRoles) {
      return true;
    }

    // Verifica se o usuário existe e detém o papel necessário
    if (!payload || !payload.role) {
      throw new ForbiddenException(`You don't have permission to access this resource`);
    }

    const hasPermission = requiredRoles.some(role => payload.role === role);
    
    if (!hasPermission) {
      throw new ForbiddenException(`You don't have permission to access this resource`);
    }
    
    return true;
  }
}