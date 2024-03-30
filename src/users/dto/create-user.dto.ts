import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
}
