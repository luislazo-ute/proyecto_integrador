import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

type RequestWithUser = Request & {
  user?: {
    rol?: string | null;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[] | undefined>(
      'roles',
      context.getHandler(),
    );

    if (!roles) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userRol = request.user?.rol;
    if (!userRol) return false;

    return roles.includes(userRol);
  }
}
