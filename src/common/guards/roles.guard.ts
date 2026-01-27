import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

type RequestWithUser = Request & {
  user?: { rol?: string | null };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ✅ lee roles del método y de la clase
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!roles || roles.length === 0) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userRolRaw = request.user?.rol;

    const userRol = String(userRolRaw ?? '').trim().toUpperCase();
    if (!userRol) return false;

    const allowed = (roles ?? []).map((r) => String(r ?? '').trim().toUpperCase());
    return allowed.includes(userRol);
  }
}
