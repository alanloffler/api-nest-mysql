import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { Role } from '../../common/enums/role.enum';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

export function Auth(role: Role) {
    return applyDecorators(Roles(role), UseGuards(AuthGuard, RolesGuard));
}
