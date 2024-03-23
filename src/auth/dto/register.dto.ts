import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
    @IsEmail()
    email: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(1)
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
    @IsIn(['admin', 'user'])
    type: string;
}
