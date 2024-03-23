import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    type: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
