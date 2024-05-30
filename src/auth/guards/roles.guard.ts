import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthConfig } from '../../common/config/auth.config';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const role = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!role) return true;

        const { user } = context.switchToHttp().getRequest();
        if (user.role === Role.ADMIN) return true;

        if (role === user.role) {
            return true;
        } else {
            throw new HttpException(AuthConfig.credentialsNotFound, HttpStatus.FORBIDDEN);
        }
    }
}
