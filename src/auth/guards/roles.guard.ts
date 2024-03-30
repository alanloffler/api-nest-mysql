import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const role = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [context.getHandler(), context.getClass()]);

        if (!role) return true;

        const { user } = context.switchToHttp().getRequest();
        console.log(user);

        if (user.role === Role.ADMIN) return true;

        if (role === user.role) {
            return true;
        } else {
            throw new ForbiddenException('Admin credentials not found');
        }
    }
}
