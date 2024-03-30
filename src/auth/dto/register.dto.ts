import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
    @IsEmail()
    email: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(1)
    @IsOptional()
    name: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6)
    password: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(9)
    @IsOptional()
    phone?: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @IsOptional()
    role: Role;
}
