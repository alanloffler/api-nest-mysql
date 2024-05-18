import { IsLowercase, IsString, IsUppercase, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
    @IsString()
    @Transform(({ value }) => value.trim())
    @MinLength(1)
    @IsUppercase()
    name: string;

    @IsString()
    @Transform(({ value }) => value.trim())
    @MinLength(1)
    @IsLowercase()
    value: string;

    @IsString()
    @Transform(({ value }) => value.trim())
    @MinLength(1)
    @IsLowercase()
    title: string;
}
